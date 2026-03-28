import { useState } from "react";
import type { Mazo } from "../api/apis";
import { getColorEtiqueta } from "../constans/etiquetaColores";

interface TarjetaComponentProps {
    mazo: Mazo;
}

const COLORES_DIFICULTAD: Record<string, string> = {
    Facil: "text-green-500",
    Intermedio: "text-yellow-500",
    Avanzado: "text-red-500",
};

// const COLORES_ETIQUETA: Record<string, string> = {
//     javascript: "bg-yellow-400/20 text-yellow-300 border-yellow-400/40",
//     typescript: "bg-blue-400/20 text-blue-300 border-blue-400/40",
//     python: "bg-green-400/20 text-green-300 border-green-400/40",
//     rust: "bg-orange-400/20 text-orange-300 border-orange-400/40",
//     go: "bg-cyan-400/20 text-cyan-300 border-cyan-400/40",
//     java: "bg-red-400/20 text-red-300 border-red-400/40",
//     css: "bg-pink-400/20 text-pink-300 border-pink-400/40",
//     html: "bg-orange-500/20 text-orange-300 border-orange-500/40",
//     csharp: "bg-purple-400/20 text-purple-300 border-purple-400/40",
// };

// function getColorEtiqueta(nombre: string): string {
//     const clave = nombre.toLowerCase().replace("#", "sharp").replace("+", "");
//     return COLORES_ETIQUETA[clave] ?? "bg-zinc-400/20 text-zinc-300 border-zinc-400/40";
// }

export default function TarjetaComponent({ mazo }: TarjetaComponentProps) {
    const [dificultad, setDificultad] = useState<string>("Facil");

    return (
        <div
            className={[
                "rounded-xl border-2 px-4 py-5 text-center transition-all duration-200",
                "cursor-pointer select-none",
                "border-dotted border-[var(--border-default)] text-[var(--text-primary)]",
                "hover:border-[var(--text-primary)] hover:bg-[var(--bg-card)]",
            ].join(" ")}
        >
            <div className="flex items-center justify-between gap-3 text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                    nivel:
                    <select
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