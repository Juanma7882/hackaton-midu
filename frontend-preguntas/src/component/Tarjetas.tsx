import { useEffect, useMemo, useState } from "react";
import { construirUrlAsset, obtenerEtiquetas, type Dificultad, type Etiqueta } from "../api/apis";
import TarjetaComponent from "./TarjetaComponent";
import { useNavigate } from "react-router-dom";
import { useQuizStore } from "../store/useQuizStore";
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

    const slugify = (text: string) =>
        text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");

    const etiquetasDelMazo = (mazoId: number) => {
        return mazos.find((m) => m.id === mazoId)?.etiquetas.map((e) => e.id) || [];
    }

    const irAPreguntas = (mazo: Mazo, dificultad: string) => {
        const etiquetasSeleccionadas = etiquetasDelMazo(mazo.id);

        setQuiz({
            mazoId: mazo.id,
            dificultad,
            etiquetasSeleccionadas,
            mazo,
        });

        navigate(`/preguntas/${slugify(mazo.nombre)}`);
    };

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
