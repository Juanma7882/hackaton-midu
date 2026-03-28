import { useEffect, useMemo, useState } from "react";
import { construirUrlAsset, obtenerMazo, type Mazo } from "../api/apis";
import TarjetaComponent from "./TarjetaComponent";

interface TarjetasProps {
    filtro: string;
    mazos: Mazo[];
    loading: boolean;
}

export default function Tarjetas({ filtro, mazos, loading }: TarjetasProps) {
    const mazosFiltrados = useMemo(() =>
        mazos.filter((mazo) =>
            mazo.nombre.toLowerCase().includes(filtro.toLowerCase())
        ),
        [mazos, filtro]);

    const mazosConmpletos = mazosFiltrados.map(mazo => ({
        ...mazo,
        pathCompletoUrl: construirUrlAsset(mazo.url || "")
    }));

    if (loading === true) {
        return <div>Cargando...</div>;
    }

    if (filtro.length > 0 && mazosConmpletos.length === 0) {
        return (
            <div className="text-2xl md:text-3xl col-span-full text-[var(--text-primary)]">
                Ninguna etiqueta coincide con el filtro
            </div>
        );
    }

    return (
        <>
            {mazosConmpletos.map((mazo) => (
                <button
                    type="button"
                    className="text-left"
                    key={mazo.id}>
                    <TarjetaComponent
                        mazo={mazo}
                    />
                </button>
            ))}
        </>
    );
}
