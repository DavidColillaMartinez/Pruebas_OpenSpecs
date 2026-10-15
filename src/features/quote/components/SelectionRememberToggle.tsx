import { useQuoteSelection } from '../model/selectionStore';

export function SelectionRememberToggle() {
  const { count, remember, setRemember } = useQuoteSelection();
  if (count === 0) return null;
  return (
    <div className="mt-auto pt-5">
      <label className="flex items-start gap-2 text-sm text-secondary">
        <input
          type="checkbox"
          disabled={count === 0}
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="mt-1"
          data-testid="selection-remember-toggle"
        />
        <span>
          Recordar mi selección en este dispositivo hasta que la borre.
          <span className="mt-1 block text-xs leading-5 text-secondary/80">Se guarda solo en este navegador: si borras sus datos o lo abres en otro dispositivo, la selección no se conserva.</span>
        </span>
      </label>
    </div>
  );
}
