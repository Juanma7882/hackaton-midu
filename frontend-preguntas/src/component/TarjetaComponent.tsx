import type { Dificultad, Etiqueta } from "../api/apis";

const DIFICULTADES: Dificultad[] = ["Facil", "Intermedio", "Avanzado"];

interface TarjetaComponentProps {
    etiqueta: Etiqueta;
    seleccionada: boolean;
    dificultad: Dificultad;
    onToggle: () => void;
    onCambiarDificultad: (dificultad: Dificultad) => void;
}

export default function TarjetaComponent({
    etiqueta,
    seleccionada,
    dificultad,
    onToggle,
    onCambiarDificultad,
}: TarjetaComponentProps) {
    return (
        <div
            className={[
                "border px-4 py-5 transition-all duration-200",
                seleccionada
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_0_1px_var(--color-primary)]"
                    : "border-[var(--border-default)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-card)]",
            ].join(" ")}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-pressed={seleccionada}
                className="w-full cursor-pointer select-none text-center"
            >
                <h2 className={[
                    "mt-1 text-2xl md:text-3xl capitalize",
                    seleccionada ? "text-[var(--color-primary)]" : "text-[var(--text-primary)]",
                ].join(" ")}>
                    {etiqueta.nombre}
                </h2>
            </button>

            <div className="mt-4 border-t border-[var(--border-default)] pt-4">
                <label className="block text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                    Dificultad
                </label>
                <select
                    value={dificultad}
                    disabled={!seleccionada}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => onCambiarDificultad(event.target.value as Dificultad)}
                    className="mt-2 w-full cursor-pointer rounded border border-[var(--border-default)] bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                    {DIFICULTADES.map((opcion) => (
                        <option key={opcion} value={opcion} className="bg-black text-white">
                            {opcion}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
