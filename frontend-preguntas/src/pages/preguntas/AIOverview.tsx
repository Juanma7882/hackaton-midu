import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import type { Evaluacion, QuizOverview } from "../../api/apis";
import { useEffect, useState } from "react";

interface AIOverviewProps {
    overview: QuizOverview | null;
    evaluaciones: Evaluacion[];
    loading?: boolean;
    evaluandoPreguntaId?: number | null;
    promedioActual: number;
    analisisFinalPendiente: boolean;
    error?: string | null;
    quizTerminado?: boolean;
    completionMeta?: {
        elapsedSeconds: number;
        totalSeconds: number;
    } | null;
}

function formatearDuracion(totalSegundos: number) {
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

export default function AIOverview({
    overview,
    evaluaciones,
    loading,
    evaluandoPreguntaId,
    promedioActual,
    analisisFinalPendiente,
    error,
    quizTerminado = false,
    completionMeta = null,
}: AIOverviewProps) {
    const percentage = overview?.puntuacionGeneral ?? promedioActual;

    const [circularProgressbarLoading, setCircularProgressbarLoading] = useState(false);
    const [loadingDots, setLoadingDots] = useState(".");

    useEffect(() => {
        if (evaluandoPreguntaId !== null && evaluandoPreguntaId !== undefined) {
            setCircularProgressbarLoading(true);
        } else {
            setCircularProgressbarLoading(false);
        }
    }, [evaluandoPreguntaId]);

    useEffect(() => {
        if (!circularProgressbarLoading) {
            setLoadingDots(".");
            return;
        }

        const frames = [".", "..", "..."];
        let frameIndex = 0;

        const interval = window.setInterval(() => {
            frameIndex = (frameIndex + 1) % frames.length;
            setLoadingDots(frames[frameIndex]);
        }, 300);

        return () => window.clearInterval(interval);
    }, [circularProgressbarLoading]);

    const tiempoCompletado = completionMeta ? formatearDuracion(completionMeta.elapsedSeconds) : null;

    return (
        <div className={`flex flex-row gap-4 ${quizTerminado ? "w-full justify-center" : ""}`}>
            <div className={`flex flex-col gap-5 border border-[var(--border-default)] rounded-lg p-8 items-center ${quizTerminado ? "w-full max-w-5xl" : "min-w-96 max-w-[32rem]"}`}>
                <div className="flex flex-col gap-2 justify-center items-center">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">AI Overview</h2>
                    {quizTerminado && (
                        <>
                            <p className="text-lg font-semibold text-[var(--color-primary)]">Congratulations! Completaste el quiz.</p>
                            {tiempoCompletado && (
                                <p className="text-sm text-[var(--text-secondary)]">Quiz completado en: {tiempoCompletado}</p>
                            )}
                        </>
                    )}
                </div>
                {loading ? (
                    <p className="text-[var(--text-secondary)]">La IA local esta preparando el analisis final del quiz...</p>
                ) : error ? (
                    <p className="text-sm text-red-400">{error}</p>
                ) : (
                    <>
                        <div className="w-38 h-38">
                            <CircularProgressbar
                                value={percentage}
                                text={circularProgressbarLoading ? loadingDots : `${percentage}%`}
                                styles={buildStyles({
                                    pathColor: "var(--color-primary)",
                                    trailColor: "var(--border-default)",
                                    textColor: "var(--text-primary)",
                                    ...(circularProgressbarLoading && {
                                        pathColor: "var(--color-primary)",
                                        trailColor: "var(--border-default)",
                                        textColor: "var(--text-primary)",
                                    }),
                                })}
                            />
                        </div>

                        {overview ? (
                            <div className="flex flex-col gap-5">
                                <p className="text-sm text-[var(--text-secondary)]">{overview.resumen}</p>

                                {overview.cosasParaMejorar.length > 0 && (
                                    <section className="flex flex-col gap-2">
                                        <p className="text-lg font-semibold text-[var(--text-primary)] underline">Cosas para mejorar</p>
                                        <ul className="text-sm text-[var(--color-primary)] list-disc list-inside space-y-1">
                                            {overview.cosasParaMejorar.map((mejora, index) => (
                                                <li className="text-lg text-[var(--color-primary)]" key={`${mejora}-${index}`}>{mejora}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {overview.fortalezas.length > 0 && (
                                    <section className="flex flex-col gap-2">
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">Fortalezas</p>
                                        <ul className="text-sm text-[var(--text-secondary)] list-disc list-inside space-y-1">
                                            {overview.fortalezas.map((fortaleza, index) => (
                                                <li key={`${fortaleza}-${index}`}>{fortaleza}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                <section className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">Desglose de respuestas</p>
                                    <div className="flex flex-col gap-3 max-h-[24rem] overflow-auto pr-1">
                                        {overview.evaluaciones.map((evaluacion) => (
                                            <article key={evaluacion.preguntaId} className="rounded-lg border border-[var(--border-default)] p-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <p className="text-sm text-[var(--text-primary)]">
                                                        {evaluacion.pregunta ?? `Pregunta #${evaluacion.preguntaId}`}
                                                    </p>
                                                    <span className="text-sm font-bold text-[var(--color-primary)]">{evaluacion.puntuacion}%</span>
                                                </div>
                                                <p className="mt-2 text-xs text-[var(--text-secondary)]">{evaluacion.feedback}</p>
                                            </article>
                                        ))}
                                    </div>
                                </section>

                                <p className="text-xs text-[var(--text-secondary)]">Modelo final: {overview.modelo}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-[var(--text-secondary)]">
                                    A medida que vayas mostrando respuestas, nuestro modelo de AI va guardando puntajes y feedback individuales. Al final del quiz vas a ver el analisis completo.
                                </p>

                                {analisisFinalPendiente && (
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Ya estan todas las respuestas evaluadas. Ahora se esta armando el insight final.
                                    </p>
                                )}

                                {evaluaciones.length > 0 && (
                                    <section className="flex flex-col gap-2">
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">Progreso evaluado</p>
                                        <ul className="text-sm text-[var(--text-secondary)] list-disc list-inside space-y-1">
                                            {evaluaciones.map((evaluacion) => (
                                                <li key={evaluacion.preguntaId}>
                                                    {evaluacion.pregunta ?? `Pregunta #${evaluacion.preguntaId}`}: {evaluacion.puntuacion}%
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
