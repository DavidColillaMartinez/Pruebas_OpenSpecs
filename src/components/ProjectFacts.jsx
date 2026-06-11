import { GoldLabel } from './GoldLabel';

export function ProjectFacts({ facts, className = '' }) {
  return (
    <div className={`mt-7 space-y-4 ${className}`}>
      {facts.map((text, index) => (
        <GoldLabel key={text} number={index + 1} text={text} />
      ))}
    </div>
  );
}
