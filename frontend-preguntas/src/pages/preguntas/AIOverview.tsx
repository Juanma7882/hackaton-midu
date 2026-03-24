import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import type { Evaluacion } from "../../api/apis";

interface AIOverviewProps {
    evaluacion: Evaluacion | null;
    loading?: boolean;
    error?: string | null;
    reset: () => void;
}

export default function AIOverview({ evaluacion, loading, error, reset }: AIOverviewProps) {
    const percentage = evaluacion?.puntuacion ?? 0;
    return (
        <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-2 border border-[var(--border-default)] rounded-lg p-8 min-w-96">
                <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">AI Overview</p>
                </div>
                {loading ? (
                    <p className="text-[var(--text-secondary)]">Evaluando...</p>
                ) : error ? (
                    <p className="text-sm text-red-400">{error}</p>
                ) : (
                    <>
                        <div className="w-38 h-38">
                            <CircularProgressbar
                                value={percentage}
                                text={`${percentage}%`}
                                styles={buildStyles({
                                    pathColor: "var(--color-primary)",
                                    trailColor: "var(--border-default)",
                                    textColor: "var(--text-primary)",
                                })}
                            />
                        </div>
                        <br />
                        {evaluacion ? (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {evaluacion.feedback}
                                </p>
                                {evaluacion.mejoras.length > 0 && (
                                    <ul className="text-sm text-[var(--color-primary)] list-disc list-inside">
                                        {evaluacion.mejoras.map((m, i) => (
                                            <li key={i}>{m}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)]">
                                Muestra la respuesta para que la IA evalue tu contestacion y calcule el porcentaje de acierto.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
