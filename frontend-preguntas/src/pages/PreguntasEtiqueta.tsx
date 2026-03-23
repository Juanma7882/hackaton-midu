import { useEffect, useMemo, useState } from "react";
import { obtenerEtiquetaConPregunta, obtenerPreguntasPorEtiquetas, type Pregunta } from "../api/apis";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function PreguntasEtiqueta() {
    const { nombre } = useParams<{ nombre: string }>();
    const [searchParams] = useSearchParams();
    const [rspApi, setRspApi] = useState<Pregunta[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [blurRespuesta, setBlurRespuesta] = useState<boolean>(false);
    const navigate = useNavigate();

    const etiquetasSeleccionadas = useMemo(() => {
        const etiquetasDesdeQuery = searchParams.get("temas");

        if (!etiquetasDesdeQuery) {
            return nombre ? [nombre] : [];
        }

        return etiquetasDesdeQuery
            .split(",")
            .map((etiqueta) => etiqueta.trim())
            .filter(Boolean);
    }, [nombre, searchParams]);

    useEffect(() => {
        const cargarPreguntas = async () => {
            if (etiquetasSeleccionadas.length === 0) {
                setRspApi([]);
                setLoading(false);
                return;
            }

            try {
                const rsp = etiquetasSeleccionadas.length === 1 && nombre
                    ? await obtenerEtiquetaConPregunta(etiquetasSeleccionadas[0])
                    : await obtenerPreguntasPorEtiquetas(etiquetasSeleccionadas);

                setRspApi(rsp);
                setCurrentIndex(0);
                setBlurRespuesta(false);
            } catch (error) {
                console.error("Error al obtener preguntas por etiqueta", error);
                setRspApi([]);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        cargarPreguntas();
    }, [etiquetasSeleccionadas, nombre]);

    const anteriorTarjeta = () => {
        if (currentIndex > 0) {
            setBlurRespuesta(false);
            setCurrentIndex(currentIndex - 1);
        }
    };

    const siguienteTarjeta = () => {
        if (currentIndex < rspApi.length - 1) {
            setBlurRespuesta(false);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const mostrarRespuesta = () => {
        setBlurRespuesta((prev) => !prev);
    };

    if (loading === true) {
        return <div className="text-white">Cargando...</div>;
    }

    if (etiquetasSeleccionadas.length === 0) {
        return (
            <div className="w-11/12 max-w-3xl border border-white/20 p-8 text-center text-white flex flex-col gap-6">
                <h2 className="text-2xl md:text-3xl">No has seleccionado ningun tema</h2>
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="cursor-pointer border border-cyan-500 px-5 py-3 rounded-lg"
                >
                    Volver al menu principal
                </button>
            </div>
        );
    }

    if (rspApi.length === 0) {
        return (
            <div className="w-11/12 max-w-3xl border border-white/20 p-8 text-center text-white flex flex-col gap-6">
                <h2 className="text-2xl md:text-3xl">No hay preguntas para los temas seleccionados</h2>
                <p className="text-white/70">Temas: {etiquetasSeleccionadas.join(", ")}</p>
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="cursor-pointer border border-cyan-500 px-5 py-3 rounded-lg"
                >
                    Volver al menu principal
                </button>
            </div>
        );
    }

    const tarjetaActual = rspApi[currentIndex];
    const temasTarjeta = tarjetaActual.Etiqueta?.map((etiqueta) => etiqueta.nombre) ?? [];

    return (
        <div className="h-fit w-11/12 max-w-5xl border-yellow-500/80 border-3 text-zinc-300 p-5 flex flex-col gap-8 sm:p-10">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 text-sm text-white/70">
                    {etiquetasSeleccionadas.map((etiqueta) => (
                        <span key={etiqueta} className="rounded-full border border-white/20 px-3 py-1">
                            {etiqueta}
                        </span>
                    ))}
                </div>
                <progress className="w-full h-2 bg-red-100 rounded-full" value={currentIndex + 1} max={rspApi.length}></progress>
                <span className="text-sm text-white/60">
                    Pregunta {currentIndex + 1} de {rspApi.length}
                </span>
            </div>
            <div className="border-blue-500 border-2 p-5 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                    {temasTarjeta.map((tema) => (
                        <span key={tema}>{tema}</span>
                    ))}
                </div>
                <h2>{tarjetaActual.pregunta}</h2>
            </div>
            <div className="border-green-500 border-2 p-5 ">
                <p className={blurRespuesta ? "transition-all duration-500" : "blur-3xl transition-all duration-500 select-none text-black"}>
                    {tarjetaActual.respuesta}
                </p>
            </div>
            <div className="border-purple-600 border-2 p-5 flex flex-col gap-5 text-center">
                <div onClick={mostrarRespuesta} className="cursor-pointer border-cyan-500 border-2 p-5">
                    <span className="select-none">{blurRespuesta ? "ocultar respuesta" : "mostrar respuesta"}</span>
                </div>
                <div className="flex justify-between gap-5 ">
                    <div onClick={anteriorTarjeta} className={currentIndex === 0 ? "w-full cursor-pointer  select-none border-amber-50 border-2 p-5 opacity-50" : "w-full cursor-pointer  select-none  border-2 p-5 border-rose-500"}>
                        <span>anterior</span>
                    </div>
                    <div onClick={siguienteTarjeta} className={currentIndex < rspApi.length - 1 ? "w-full cursor-pointer select-none  border-rose-500 border-2 p-5 " : "w-full cursor-pointer select-none  border-amber-50 border-2 p-5 opacity-50"}>
                        <span>siguiente</span>
                    </div>
                </div>
                <div onClick={() => { navigate("/") }} className="cursor-pointer border-cyan-500 border-2 p-5">
                    <span className="select-none">volver al menu principal</span>
                </div>
            </div>

        </div>
    );
}

export default PreguntasEtiqueta;
