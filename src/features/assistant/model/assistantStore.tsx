/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { sendHttpChatMessage } from '../transport/httpAdapter';
import { sendDemoChatMessage, isDemoModeEnabled } from '../transport/demoAdapter';
import {
  DEFAULT_CHAT_ERROR_TEXT,
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
export const MAX_STORED_MESSAGE_LENGTH = 8000;
export const MAX_STORED_MESSAGES = 60;
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

function settlePending(messages: AssistantChatMessage[]): AssistantChatMessage[] {
  return messages.map((message) => (message.id === 'pending-user' ? { ...message, id: nextMessageId() } : message));
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
    // Remove legacy browser copies; conversations now live only in React memory.
    try { sessionStorage.removeItem(ASSISTANT_STORAGE_KEY); } catch { /* storage may be disabled */ }
    demoModeRef.current = isDemoModeEnabled();
    mountedRef.current = true;
  }, []);

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
