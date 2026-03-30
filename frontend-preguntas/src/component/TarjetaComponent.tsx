import type { Dificultad, Mazo } from "../api/apis";
import { getColorEtiqueta } from "../constans/etiquetaColores";

interface TarjetaComponentProps {
    mazo: Mazo;
    seleccionada: boolean;
    dificultad: Dificultad;
    onSeleccionar: () => void;
    onCambiarDificultad: (dificultad: Dificultad) => void;
}

const COLORES_DIFICULTAD: Record<string, string> = {
    Facil: "text-green-500",
    Intermedio: "text-yellow-500",
    Avanzado: "text-red-500",
};

export default function TarjetaComponent({
    mazo,
    seleccionada,
    dificultad,
    onSeleccionar,
    onCambiarDificultad,
}: TarjetaComponentProps) {
    return (
        <div
            onClick={onSeleccionar}
            className={[
                "border px-5 py-5 text-center transition-all duration-200 w-full max-w-none min-w-0",
                "cursor-pointer select-none",
                "border-dotted border-[var(--border-default)] text-[var(--text-primary)]",
                "hover:border-[var(--text-primary)] hover:bg-[var(--bg-card)] w-full",
                seleccionada ? "border-[var(--color-primary)] shadow-[0_0_15px_rgba(33,255,0,0.3)]" : "",
            ].join(" ")}
        >
            <div className="flex items-center justify-between gap-3 text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                    nivel:
                    <select
                        onClick={(e) => e.stopPropagation()}
                        value={dificultad}
                        onChange={(e) => onCambiarDificultad(e.target.value as Dificultad)}
                        className={[
                            "bg-white dark:bg-black",
                            " border-zinc-300 dark:border-gray-900",
                            "rounded px-1 py-0.5 text-xs uppercase tracking-widest",
                            "outline-none cursor-pointer",
                            COLORES_DIFICULTAD[dificultad],
                        ].join(" ")}
                    >
                        <option value="Facil">Fácil</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                    </select>
                </span>
            </div>

            <h2 className="mt-3 text-left text-2xl md:text-3xl">{mazo.nombre}</h2>
            <p className="mt-1 text-sm text-left text-[var(--text-muted)]">{mazo.descripcion}</p>

            <div className="mt-3 flex flex-wrap justify-start items-center gap-2">
                {mazo.etiquetas.map((etiqueta) => (
                    <span
                        key={etiqueta.id}
                        className={[
                            "rounded-full border px-2.5 py-0.5 text-xs font-mono font-semibold tracking-wide",
                            getColorEtiqueta(etiqueta.nombre),
                        ].join(" ")}
                    >
                        {etiqueta.nombre}
                    </span>
                ))}
            </div>
        </div>
    );
}