/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { sendHttpChatMessage } from '../transport/httpAdapter';
import { sendDemoChatMessage, isDemoModeEnabled } from '../transport/demoAdapter';
import {
  DEFAULT_CHAT_ERROR_TEXT,
  isChatAction,
  type ChatAction,
  type ChatErrorKind,
  type ChatMessagePayload,
  type ChatRecommendedProduct,
} from '../transport/types';
import { buildChatContext } from './useChatContext';

export const ASSISTANT_STORAGE_KEY = 'lrmq:assistant:chat:v1';
const ASSISTANT_STORAGE_VERSION = 1;
const MAX_CONVERSATION_TURN = 20;
export const INITIAL_ASSISTANT_MESSAGE = 'Hola, soy el asistente virtual de Area LRMQ. Puedo orientarte sobre reformas y ayudarte a encontrar productos de nuestro catálogo. ¿Qué necesitas?';

export type AssistantChatStatus = 'idle' | 'sending' | 'unavailable' | 'expired';

export type AssistantChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  products?: ChatRecommendedProduct[];
  actions?: ChatAction[];
  errorKind?: ChatErrorKind;
};

type SerializableState = {
  version: number;
  conversationId: string | null;
  messages: AssistantChatMessage[];
};

type AssistantState = SerializableState & {
  status: AssistantChatStatus;
};

type AssistantAction =
  | { type: 'restore'; state: SerializableState }
  | { type: 'start'; text: string }
  | { type: 'respond'; requestId: string; conversationId: string; message: string; products?: ChatRecommendedProduct[]; actions?: ChatAction[] }
  | { type: 'fail'; requestId: string; code: ChatErrorKind }
  | { type: 'new_conversation' };

export function createInitialMessages(): AssistantChatMessage[] {
  return [{ id: 'initial', role: 'assistant', text: INITIAL_ASSISTANT_MESSAGE }];
}

let messageIdSeed = 0;
export function nextMessageId(): string {
  messageIdSeed += 1;
  return `assistant-msg-${messageIdSeed}`;
}

const initialState: AssistantState = {
  version: ASSISTANT_STORAGE_VERSION,
  conversationId: null,
  messages: createInitialMessages(),
  status: 'idle',
};

function toSerializable(state: AssistantState): SerializableState {
  return {
    version: ASSISTANT_STORAGE_VERSION,
    conversationId: state.conversationId,
    messages: state.messages.filter((message) => message.id !== 'pending-user' && message.errorKind === undefined),
  };
}

function settlePending(messages: AssistantChatMessage[]): AssistantChatMessage[] {
  return messages.map((message) => (message.id === 'pending-user' ? { ...message, id: nextMessageId() } : message));
}

function readStoredState(): SerializableState | null {
  try {
    const raw = sessionStorage.getItem(ASSISTANT_STORAGE_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw) as Record<string, unknown> | null;
    if (!record || record.version !== ASSISTANT_STORAGE_VERSION || typeof record.conversationId !== 'string') return null;
    if (!Array.isArray(record.messages)) return null;
    for (const item of record.messages.slice(1)) {
      const message = item as AssistantChatMessage;
      if (!message || typeof message.id !== 'string' || typeof message.text !== 'string') return null;
      if (message.role !== 'assistant' && message.role !== 'user') return null;
    }
    const messages = (record.messages as AssistantChatMessage[]).map((message) => ({
      id: message.id,
      role: message.role,
      text: message.text,
      ...(message.products ? { products: message.products } : {}),
      ...(Array.isArray(message.actions) ? { actions: message.actions.filter(isChatAction) } : {}),
    }));
    if (!messages.length || messages[0].role !== 'assistant') return null;
    if (messages.length === 1 && messages[0].text !== INITIAL_ASSISTANT_MESSAGE) return null;
    return { version: ASSISTANT_STORAGE_VERSION, conversationId: String(record.conversationId), messages };
  } catch {
    return null;
  }
}

export function assistantReducer(state: AssistantState, action: AssistantAction): AssistantState {
  switch (action.type) {
    case 'restore':
      return { ...action.state, status: 'idle' };
    case 'start':
      if (state.status !== 'idle' && state.status !== 'expired' && state.status !== 'unavailable') return state;
      return {
        ...state,
        status: 'sending',
        messages: [...settlePending(state.messages), { id: 'pending-user', role: 'user', text: action.text }],
      };
    case 'respond':
      if (state.status !== 'sending') return state;
      return {
        ...state,
        status: 'idle',
        conversationId: action.conversationId,
        messages: [...settlePending(state.messages), { id: nextMessageId(), role: 'assistant', text: action.message, ...(action.products ? { products: action.products } : {}), ...(action.actions?.length ? { actions: action.actions } : {}) }],
      };
    case 'fail': {
      if (state.status !== 'sending') return state;
      const settled = settlePending(state.messages);
      if (action.code === 'SESSION_EXPIRED') {
        return {
          version: ASSISTANT_STORAGE_VERSION,
          conversationId: null,
          status: 'idle',
          messages: [...settled, { id: nextMessageId(), role: 'assistant', text: DEFAULT_CHAT_ERROR_TEXT.SESSION_EXPIRED, errorKind: 'SESSION_EXPIRED' }],
        };
      }
      return {
        ...state,
        status: action.code === 'CHAT_UNAVAILABLE' ? 'unavailable' : 'idle',
        messages: [...settled, { id: nextMessageId(), role: 'assistant', text: DEFAULT_CHAT_ERROR_TEXT[action.code], errorKind: action.code }],
      };
    }
    case 'new_conversation':
      return {
        version: ASSISTANT_STORAGE_VERSION,
        conversationId: null,
        status: 'idle',
        messages: createInitialMessages().map((message, index) => (index === 0 ? { ...message, id: nextMessageId() } : message)),
      };
    default:
      return state;
  }
}

type AssistantChatContextValue = {
  status: AssistantChatStatus;
  demoMode: boolean;
  messages: AssistantChatMessage[];
  conversationId: string | null;
  sendMessage: (text: string) => void;
  startNewConversation: () => void;
};

const emptyAssistantContext: AssistantChatContextValue = {
  status: 'idle',
  demoMode: false,
  messages: initialState.messages,
  conversationId: null,
  sendMessage: () => undefined,
  startNewConversation: () => undefined,
};

const AssistantChatContext = createContext<AssistantChatContextValue>(emptyAssistantContext);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assistantReducer, initialState);
  const demoModeRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const inFlightRequestIdRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    const stored = readStoredState();
    if (stored) dispatch({ type: 'restore', state: stored });
    demoModeRef.current = isDemoModeEnabled();
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return undefined;
    try {
      sessionStorage.setItem(ASSISTANT_STORAGE_KEY, JSON.stringify(toSerializable(state)));
    } catch {
      /* ignore storage quota errors */
    }
    return undefined;
  }, [state]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    const current = stateRef.current;
    if (!trimmed || current.status === 'sending' || inFlightRequestIdRef.current) return;

    const requestId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `request-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    inFlightRequestIdRef.current = requestId;

    const payload: ChatMessagePayload = {
      version: 1,
      conversationId: current.conversationId,
      conversationTurn: Math.min(MAX_CONVERSATION_TURN, Math.max(current.conversationId ? 1 : 0, current.messages.filter((message) => message.role === 'user').length)),
      requestId,
      message: trimmed,
      context: buildChatContext(window.location.pathname, window.location.search),
    };

    dispatch({ type: 'start', text: trimmed });

    void (async () => {
      const sender = demoModeRef.current ? sendDemoChatMessage : sendHttpChatMessage;
      console.log('STORE_SEND', requestId, 'inFlight=', JSON.stringify(inFlightRequestIdRef.current), 'statusRef=', stateRef.current.status);
      const result = await sender(payload);
      if (inFlightRequestIdRef.current !== requestId) {
        return;
      }
      inFlightRequestIdRef.current = null;
      if (result.kind === 'success') {
        dispatch({
          type: 'respond',
          requestId,
          conversationId: result.conversationId,
          message: result.message,
          products: result.products.length ? result.products : undefined,
          actions: result.actions.length ? result.actions : undefined,
        });
      } else if (result.kind === 'error') {
        dispatch({ type: 'fail', requestId, code: result.code });
      } else {
        dispatch({ type: 'fail', requestId, code: 'CHAT_UNAVAILABLE' });
      }
    })();
  };

  const startNewConversation = () => {
    inFlightRequestIdRef.current = null;
    dispatch({ type: 'new_conversation' });
  };

  const contextValue = useMemo<AssistantChatContextValue>(() => ({
    status: state.status,
    demoMode: demoModeRef.current,
    messages: state.messages,
    conversationId: state.conversationId,
    sendMessage,
    startNewConversation,
  }), [state.status, state.messages, state.conversationId]);

  return <AssistantChatContext.Provider value={contextValue}>{children}</AssistantChatContext.Provider>;
}

export function useAssistantChat(): AssistantChatContextValue {
  return useContext(AssistantChatContext);
}
