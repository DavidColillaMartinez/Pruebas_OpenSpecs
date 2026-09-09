import { handleChatRequest } from '../../server/chat/proxy.js';

export default function handler(request, response) {
  return handleChatRequest(request, response);
}
