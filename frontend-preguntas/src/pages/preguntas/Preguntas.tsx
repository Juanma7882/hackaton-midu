import { useCallback, useMemo, useState } from "react";
import PreguntasEtiqueta from "./PreguntasEtiqueta";
import AIOverview from "./AIOverview";
import {
    evaluarRespuestas,
    generarResumenQuiz,
    type Evaluacion,
    type Pregunta,
    type PreguntaAEvaluar,
    type QuizOverview,
} from "../../api/apis";
import { useParams } from "react-router-dom";

interface QuizCompletionMeta {
    elapsedSeconds: number;
    totalSeconds: number;
}

function mapPreguntaAEvaluar(pregunta: Pregunta, respuestaUsuario: string): PreguntaAEvaluar {
    return {
        preguntaId: pregunta.id,
        pregunta: pregunta.pregunta,
        respuestaCorrecta: pregunta.respuesta,
        respuestaUsuario,
        etiquetas: (pregunta.Etiqueta ?? pregunta.etiquetas ?? []).map((etiqueta) =>
            typeof etiqueta === "string" ? etiqueta : etiqueta.nombre
        ),
    };
}

export default function Preguntas() {
    const [overview, setOverview] = useState<QuizOverview | null>(null);
    const [evaluaciones, setEvaluaciones] = useState<Record<number, Evaluacion>>({});
    const [preguntasEvaluadas, setPreguntasEvaluadas] = useState<Record<number, true>>({});
    const [evalLoading, setEvalLoading] = useState(false);
    const [evaluandoPreguntaId, setEvaluandoPreguntaId] = useState<number | null>(null);
    const [evalError, setEvalError] = useState<string | null>(null);
    const { slug } = useParams();
    const [respuestasUsuario, setRespuestasUsuario] = useState<Record<number, string>>({});
    const [preguntasTotales, setPreguntasTotales] = useState<Pregunta[]>([]);
    const [quizTerminado, setQuizTerminado] = useState(false);
    const [completionMeta, setCompletionMeta] = useState<QuizCompletionMeta | null>(null);

    const reset = useCallback(() => {
        setOverview(null);
        setEvaluaciones({});
        setPreguntasEvaluadas({});
        setEvalLoading(false);
        setEvaluandoPreguntaId(null);
        setEvalError(null);
        setRespuestasUsuario({});
        setPreguntasTotales([]);
        setQuizTerminado(false);
        setCompletionMeta(null);
    }, []);

    const handleRespuestaChange = useCallback((preguntaId: number, respuesta: string) => {
        setRespuestasUsuario((prev) => ({
            ...prev,
            [preguntaId]: respuesta,
        }));
    }, []);

    const handleEvaluarPregunta = useCallback(async (pregunta: Pregunta) => {
        if (preguntasEvaluadas[pregunta.id] || evaluandoPreguntaId === pregunta.id) {
            return;
        }

        const payload = mapPreguntaAEvaluar(pregunta, respuestasUsuario[pregunta.id] ?? "");

        setEvaluandoPreguntaId(pregunta.id);
        setEvalError(null);

        try {
            const resultado = await evaluarRespuestas([payload]);
            const evaluacion = resultado.evaluaciones[0];

            if (evaluacion) {
                setEvaluaciones((prev) => ({
                    ...prev,
                    [pregunta.id]: {
                        ...evaluacion,
                        pregunta: pregunta.pregunta,
                    },
                }));
                setPreguntasEvaluadas((prev) => ({
                    ...prev,
                    [pregunta.id]: true,
                }));
            }
        } catch (err) {
            console.error("Error al evaluar pregunta:", err);
            setEvalError("No se pudo evaluar esta respuesta.");
        } finally {
            setEvaluandoPreguntaId(null);
        }
    }, [evaluandoPreguntaId, preguntasEvaluadas, respuestasUsuario]);

    const handleFinalizarQuiz = useCallback(async (preguntas: Pregunta[], meta: QuizCompletionMeta) => {
        setQuizTerminado(true);
        setCompletionMeta(meta);
        setEvalLoading(true);
        setEvalError(null);
        setOverview(null);

        try {
            const payloadPreguntas = preguntas.map((pregunta) =>
                mapPreguntaAEvaluar(pregunta, respuestasUsuario[pregunta.id] ?? "")
            );

            const resultado = await generarResumenQuiz({
                preguntas: payloadPreguntas,
            });

            setOverview(resultado);
        } catch (err) {
            console.error("Error al generar resumen del quiz:", err);
            setEvalError("No se pudo generar el insight final del quiz.");
        } finally {
            setEvalLoading(false);
        }
    }, [respuestasUsuario]);

    const promedioActual = useMemo(() => {
        const lista = Object.values(evaluaciones);
        if (lista.length === 0) return 0;
        return Math.round(lista.reduce((acc, item) => acc + item.puntuacion, 0) / lista.length);
    }, [evaluaciones]);

    const handlePreguntasCargadas = useCallback((preguntas: Pregunta[]) => {
        setPreguntasTotales(preguntas);
    }, []);

    const analisisFinalPendiente =
        preguntasTotales.length > 0 &&
        Object.keys(evaluaciones).length === preguntasTotales.length &&
        overview === null;

    const mostrarSoloOverview = quizTerminado;

    return (
        <>
        <div className="absolute inset-0 bg-[var(--color-primary)] opacity-5 blur-[100px] pointer-events-none"></div>
        <div className={`w-full ${mostrarSoloOverview ? "max-w-5xl" : "max-w-7xl"} flex flex-col md:flex-row gap-4 m-4`}>
            {!mostrarSoloOverview && (
                <PreguntasEtiqueta
                    respuestas={respuestasUsuario}
                    evaluaciones={evaluaciones}
                    preguntasEvaluadas={preguntasEvaluadas}
                    onRespuestaChange={handleRespuestaChange}
                    onEvaluarPregunta={handleEvaluarPregunta}
                    onFinalizarQuiz={handleFinalizarQuiz}
                    onPreguntasCargadas={handlePreguntasCargadas}
                    onCambioTema={reset}
                    finalizando={evalLoading}
                    quizFinalizado={overview !== null}
                />
            )}
            <AIOverview
                overview={overview}
                evaluaciones={Object.values(evaluaciones)}
                loading={evalLoading}
                evaluandoPreguntaId={evaluandoPreguntaId}
                promedioActual={promedioActual}
                analisisFinalPendiente={analisisFinalPendiente}
                error={evalError}
                quizTerminado={quizTerminado}
                completionMeta={completionMeta}
            />
        </div>
        </>
    );
}
