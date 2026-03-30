import { useMemo } from "react";
import type { Dificultad, Mazo } from "../api/apis";
import TarjetaComponent from "./TarjetaComponent";

interface TarjetasProps {
    filtro: string;
    mazos: Mazo[];
    selectedMazoId: number | null;
    dificultadPorMazo: Record<number, Dificultad>;
    onSeleccionarMazo: (mazoId: number) => void;
    onCambiarDificultadMazo: (mazoId: number, dificultad: Dificultad) => void;
}

export default function Tarjetas({
    filtro,
    mazos,
    selectedMazoId,
    dificultadPorMazo,
    onSeleccionarMazo,
    onCambiarDificultadMazo,
}: TarjetasProps) {
    const mazosFiltrados = useMemo(() => {
        const needle = filtro.trim().toLowerCase();
        if (!needle) return mazos;
        return mazos.filter((mazo) => mazo.nombre.toLowerCase().includes(needle));
    }, [filtro, mazos]);

    if (filtro.length > 0 && mazosFiltrados.length === 0) {
        return (
            <div className="text-2xl md:text-3xl col-span-full text-[var(--text-primary)]">
                Ningún mazo coincide con el filtro
            </div>
        );
    }
    return (
        <>
            {mazosFiltrados.map((mazo) => (
                <TarjetaComponent
                    key={mazo.id}
                    mazo={mazo}
                    seleccionada={selectedMazoId === mazo.id}
                    dificultad={dificultadPorMazo[mazo.id] ?? "Intermedio"}
                    onSeleccionar={() => onSeleccionarMazo(mazo.id)}
                    onCambiarDificultad={(dificultad) => onCambiarDificultadMazo(mazo.id, dificultad)}
                />
            ))}
        </>
    );
}
