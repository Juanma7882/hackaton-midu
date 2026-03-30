import type { Dificultad, Etiqueta, Mazo } from "../api/apis";
import { useState } from "react";
import type { Mazo } from "../api/apis";
import { getColorEtiqueta } from "../constans/etiquetaColores";

const DIFICULTADES: Dificultad[] = ["Facil", "Intermedio", "Avanzado"];

interface TarjetaComponentProps {
    mazo: Mazo;
    onSeleccionar: (dificultad: string) => void;
}

const COLORES_DIFICULTAD: Record<string, string> = {
    Facil: "text-green-500",
    Intermedio: "text-yellow-500",
    Avanzado: "text-red-500",
};

export default function TarjetaComponent({ mazo, onSeleccionar }: TarjetaComponentProps) {
    const [dificultad, setDificultad] = useState<string>("Facil");
    return (
        <div
            onClick={() => onSeleccionar(dificultad)}
            className={[
                "rounded-xl border px-4 py-5 text-center transition-all duration-200",
                "cursor-pointer select-none",
                "border-dotted border-[var(--border-default)] text-[var(--text-primary)]",
                "hover:border-[var(--text-primary)] hover:bg-[var(--bg-card)]",
            ].join(" ")}
        >
            <div className="flex items-center justify-between gap-3 text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                    nivel:
                    <select
                        onClick={(e) => e.stopPropagation()}
                        value={dificultad}
                        onChange={(e) => setDificultad(e.target.value)}
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