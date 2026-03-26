import { useState } from "react";
import PreguntasEtiqueta from "./PreguntasEtiqueta";
import AIOverview from "./AIOverview";
import { evaluarRespuestas, type Evaluacion, type Pregunta } from "../../api/apis";

export default function Preguntas() {
    const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
    const [evalLoading, setEvalLoading] = useState(false);
    const [evalError, setEvalError] = useState<string | null>(null);

    const reset = () => {
        setEvaluacion(null);
        setEvalLoading(false);
        setEvalError(null);
    }

    const handleEvaluar = async (pregunta: Pregunta, respuestaUsuario: string) => {
        if (!respuestaUsuario.trim()) {
            setEvaluacion(null);
            setEvalError("Escribe tu respuesta antes de pedir el analisis de IA.");
            return;
        }

        setEvalLoading(true);
        setEvalError(null);
        setEvaluacion(null);

        try {
            const etiquetas = (pregunta.Etiqueta ?? pregunta.etiquetas ?? []).map((e) =>
                typeof e === "string" ? e : e.nombre
            );
            const resultado = await evaluarRespuestas([
                {
                    preguntaId: pregunta.id,
                    pregunta: pregunta.pregunta,
                    respuestaCorrecta: pregunta.respuesta,
                    respuestaUsuario,
                    etiquetas,
                },
            ]);
            setEvaluacion(resultado.evaluaciones[0] ?? null);
        } catch (err) {
            console.error("Error al evaluar:", err);
            setEvalError("No se pudo generar el analisis de IA para esta respuesta.");
        } finally {
            setEvalLoading(false);
        }
    };

    return (
        <>
        <div className="absolute inset-0 bg-[var(--color-primary)] opacity-5 blur-[100px] pointer-events-none"></div>
        <div className="w-full max-w-7xl flex flex-col md:flex-row gap-4 m-4">
            <PreguntasEtiqueta onEvaluar={handleEvaluar} onCambioPregunta={reset} />
            <AIOverview evaluacion={evaluacion} loading={evalLoading} error={evalError} reset={reset} />
        </div>
        </>
    );
}
