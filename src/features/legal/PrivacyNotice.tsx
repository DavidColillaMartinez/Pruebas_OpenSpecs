import { PRIVACY_SUMMARIES } from './business';

export function PrivacyLink({ section = '' }: { section?: string }) {
  return <a href={`/privacidad${section ? `#${section}` : ''}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Política de privacidad <span className="text-xs">(nueva pestaña)</span></a>;
}

export function PrivacyNotice({ flow }: { flow: keyof typeof PRIVACY_SUMMARIES }) {
  const section = { quote: 'presupuestos', whatsapp: 'whatsapp', assistant: 'asistente' }[flow];
  return (
    <p className="text-sm leading-6 text-secondary">
      {PRIVACY_SUMMARIES[flow]}{' '}<PrivacyLink section={section} />
    </p>
  );
}
