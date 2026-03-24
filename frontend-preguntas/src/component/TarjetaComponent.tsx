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
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)] shadow-[0_0_0_1px_var(--color-primary)]"
                    : "border-dotted border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-card)]",
            ].join(" ")}
        >
            <div className="flex items-center justify-between gap-3 text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
                <span>Tema</span>
                <span>{seleccionada ? "Seleccionada" : "Disponible"}</span>
            </div>
            <h2 className="mt-3 text-2xl md:text-3xl">{etiqueta.nombre}</h2>
        </div>
    );
}
