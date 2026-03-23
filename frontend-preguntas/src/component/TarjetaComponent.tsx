import type { Etiqueta } from "../api/apis";

interface TarjetaComponentProps {
    etiqueta: Etiqueta;
    seleccionada: boolean;
}

export default function TarjetaComponent({ etiqueta, seleccionada }: TarjetaComponentProps) {
    return (
        <div
            className={[
                "rounded-xl border-2 px-4 py-5 text-center transition-all duration-200",
                "cursor-pointer select-none",
                seleccionada
                    ? "border-emerald-400 bg-emerald-400/15 text-emerald-100 shadow-[0_0_0_1px_rgba(74,222,128,0.25)]"
                    : "border-dotted border-white/80 text-white hover:border-white hover:bg-white/5",
            ].join(" ")}
        >
            <div className="flex items-center justify-between gap-3 text-sm uppercase tracking-[0.2em] text-white/60">
                <span>Tema</span>
                <span>{seleccionada ? "Seleccionada" : "Disponible"}</span>
            </div>
            <h2 className="mt-3 text-2xl md:text-3xl">{etiqueta.nombre}</h2>
        </div>
    );
}
