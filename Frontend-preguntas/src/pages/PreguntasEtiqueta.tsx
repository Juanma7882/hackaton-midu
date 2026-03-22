
import { useEffect, useState } from "react";
import { obtenerEtiquetaConPregunta, type Pregunta } from "../api/apis";
import { useNavigate, useParams } from "react-router-dom";


function PreguntasEtiqueta() {
    const { nombre } = useParams<{ nombre: string }>();
    const [rspApi, setRspApi] = useState<Pregunta[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [blurRespuesta, setBlurRespuesta] = useState<boolean>(false);
    const navigate = useNavigate();
    useEffect(() => {
        const cargarPreguntasPorEtiqueta = async () => {
            try {
                const rsp = await obtenerEtiquetaConPregunta(nombre!);
                setRspApi(rsp);
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener preguntas por etiqueta", error);
                setLoading(false);
            }
        }; cargarPreguntasPorEtiqueta();
    }, [nombre]);

    const anteriorTarjeta = () => {
        if (currentIndex > 0) {
            setBlurRespuesta(false);
            setCurrentIndex(currentIndex - 1);
        }
    }

    const siguienteTarjeta = () => {
        if (currentIndex < rspApi.length - 1) {
            setBlurRespuesta(false);
            setCurrentIndex(currentIndex + 1);
        }
    }

    const mostrarRespuesta = () => {
        setBlurRespuesta(prev => !prev);
    };

    if (loading === true) {
        return <div>Cargando...</div>;
    }

    const tarjetaActual = rspApi[currentIndex];
    return (
        <div className="h-fit w-11/12 border-yellow-500/80 border-3 text-zinc-300 p-5 flex flex-col gap-10 sm:p-10">
            <progress className="w-full h-2 bg-red-100 rounded-full" value={currentIndex + 1} max={rspApi.length}></progress>
            <div className="border-blue-500 border-2 p-5">
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
    )
}
export default PreguntasEtiqueta