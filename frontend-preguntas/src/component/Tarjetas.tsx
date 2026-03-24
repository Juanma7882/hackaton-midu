import { useEffect, useMemo, useState } from "react";
import { construirUrlAsset, obtenerEtiquetas, type Etiqueta } from "../api/apis";
import TarjetaComponent from "./TarjetaComponent";

interface TarjetasProps {
    filtro: string;
    etiquetasSeleccionadas: string[];
    onToggleEtiqueta: (nombreEtiqueta: string) => void;
}

export default function Tarjetas({
    filtro,
    etiquetasSeleccionadas,
    onToggleEtiqueta,
}: TarjetasProps) {
    const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const cargarEtiquetas = async () => {
            try {
                const data = await obtenerEtiquetas();
                setEtiquetas(data);
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener las etiquetas:", error);
                setLoading(false);
            }
        };
        cargarEtiquetas();
    }, []);

    const etiquetasFiltradas = useMemo(() => etiquetas.filter((etiqueta) =>
        etiqueta.nombre.toLowerCase().includes(filtro.toLowerCase())
    ), [etiquetas, filtro]);

    const etiquetasConImagenAñadida = etiquetasFiltradas.map(etiqueta => ({
        ...etiqueta,
        pathCompletoUrl: construirUrlAsset(etiqueta.url)
    }));

    if (loading === true) {
        return <div>Cargando...</div>;
    }

    if (filtro.length > 0 && etiquetasConImagenAñadida.length === 0) {
        return (
            <div className="text-2xl md:text-3xl col-span-full text-[var(--text-primary)]">
                Ninguna etiqueta coincide con el filtro
            </div>
        );
    }

    return (
        <>
            {etiquetasConImagenAñadida.map((etiqueta) => (
                <button
                    type="button"
                    onClick={() => onToggleEtiqueta(etiqueta.nombre)}
                    aria-pressed={etiquetasSeleccionadas.includes(etiqueta.nombre)}
                    className="text-left"
                    key={etiqueta.id}>
                    <TarjetaComponent
                        etiqueta={etiqueta}
                        seleccionada={etiquetasSeleccionadas.includes(etiqueta.nombre)}
                    />
                </button>
            ))}
        </>
    );
}
