export const ASSISTANT_WELCOME_STORAGE_KEY = 'lrmq:assistant:welcome:v1';

export function readWelcomeDismissed(): boolean {
  try {
    return sessionStorage.getItem(ASSISTANT_WELCOME_STORAGE_KEY) === 'dismissed';
  } catch {
    return false;
  }
}

export function markWelcomeDismissed(): void {
  try {
    sessionStorage.setItem(ASSISTANT_WELCOME_STORAGE_KEY, 'dismissed');
  } catch {
    /* ignore storage quota errors */
  }
}
