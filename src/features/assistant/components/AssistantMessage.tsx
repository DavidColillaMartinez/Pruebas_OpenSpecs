import type { ChatAction, ChatRecommendedProduct } from '../transport/types';
import { AssistantProductCard } from './AssistantProductCard';
import { AssistantActions } from './AssistantActions';

export function AssistantMessage({ message, actions = [] }: { message: { text: string; products?: ChatRecommendedProduct[] }; actions?: ChatAction[] }) {
  if (!message.text) return null;
  return (
    <div>
      <p className="mx-1 max-w-full text-ink break-words text-sm leading-relaxed" role="listitem">{message.text}</p>
      {message.products?.map((product) => <AssistantProductCard key={product.internalPath} product={product} />)}
      <AssistantActions actions={actions} />
    </div>
  );
}
