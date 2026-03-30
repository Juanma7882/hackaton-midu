import { useMemo } from "react";
import { construirUrlAsset, type Mazo } from "../api/apis";
import TarjetaComponent from "./TarjetaComponent";
import { useNavigate } from "react-router-dom";
import { useQuizStore } from "../store/useQuizStore";
interface TarjetasProps {
    filtro: string;
    mazos: Mazo[];
    loading: boolean;
}


export default function Tarjetas({ filtro, mazos, loading }: TarjetasProps) {
    const navigate = useNavigate();
    const setQuiz = useQuizStore((state) => state.setQuiz);

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
            {mazosConmpletos.map((mazo) => (
                <TarjetaComponent
                    key={mazo.id}
                    mazo={mazo}
                    onSeleccionar={(dificultad) =>
                        irAPreguntas(mazo, dificultad)
                    }
                />
            ))
            }
        </>
    );
}
