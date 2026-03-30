import { useEffect, useMemo, useState } from "react";
import { construirUrlAsset, obtenerEtiquetas, type Dificultad, type Etiqueta } from "../api/apis";
import TarjetaComponent from "./TarjetaComponent";

interface TarjetasProps {
    filtro: string;
    dificultadesSeleccionadas: Record<string, Dificultad>;
    onToggleEtiqueta: (nombreEtiqueta: string) => void;
    onCambiarDificultad: (nombreEtiqueta: string, dificultad: Dificultad) => void;
}

export default function Tarjetas({
    filtro,
    dificultadesSeleccionadas,
    onToggleEtiqueta,
    onCambiarDificultad,
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
        void cargarEtiquetas();
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
            {etiquetasConImagenAñadida.map((etiqueta) => {
                const seleccionada = Boolean(dificultadesSeleccionadas[etiqueta.nombre]);

                return (
                    <TarjetaComponent
                        key={etiqueta.id}
                        etiqueta={etiqueta}
                        seleccionada={seleccionada}
                        dificultad={dificultadesSeleccionadas[etiqueta.nombre] ?? "Intermedio"}
                        onToggle={() => onToggleEtiqueta(etiqueta.nombre)}
                        onCambiarDificultad={(dificultad) => onCambiarDificultad(etiqueta.nombre, dificultad)}
                    />
                );
            })}
        </>
    );
}
