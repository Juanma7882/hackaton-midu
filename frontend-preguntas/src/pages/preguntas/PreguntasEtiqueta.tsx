import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { obtenerEtiquetaConPregunta, obtenerPreguntasPorEtiquetas, type Evaluacion, type Pregunta } from "../../api/apis";

interface PreguntasEtiquetaProps {
    respuestas: Record<number, string>;
    evaluaciones: Record<number, Evaluacion>;
    preguntasEvaluadas: Record<number, true>;
    onRespuestaChange: (preguntaId: number, respuesta: string) => void;
    onEvaluarPregunta: (pregunta: Pregunta) => void | Promise<void>;
    onFinalizarQuiz: (preguntas: Pregunta[], meta: { elapsedSeconds: number; totalSeconds: number }) => void | Promise<void>;
    onPreguntasCargadas?: (preguntas: Pregunta[]) => void;
    onCambioTema?: () => void;
    finalizando?: boolean;
    quizFinalizado?: boolean;
}

const BOTON = "cursor-pointer border border-[var(--border-default)] hover:border-[var(--border-accent)] px-5 py-3 rounded-lg transition-colors text-[var(--text-primary)]";

function mezclarPreguntas(lista: Pregunta[]): Pregunta[] {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

function EstadoVacio({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
    const navigate = useNavigate();
    return (
        <div className="w-11/12 max-w-3xl border border-[var(--border-default)] p-8 text-center flex flex-col gap-6 text-[var(--text-primary)]">
            <h2 className="text-2xl md:text-3xl">{titulo}</h2>
            {subtitulo && <p className="text-[var(--text-secondary)]">{subtitulo}</p>}
            <button type="button" onClick={() => navigate("/")} className={BOTON}>
                Volver al menu principal
            </button>
        </div>
    );
}

function PreguntasEtiqueta({
    respuestas,
    evaluaciones,
    preguntasEvaluadas,
    onRespuestaChange,
    onEvaluarPregunta,
    onFinalizarQuiz,
    onPreguntasCargadas,
    onCambioTema,
    finalizando = false,
    quizFinalizado = false,
}: PreguntasEtiquetaProps) {
    const { nombre } = useParams<{ nombre: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const duracionMinutos = Number(searchParams.get("duracion") ?? 15);
    const duracionSegundos = Number.isFinite(duracionMinutos) && duracionMinutos > 0
        ? duracionMinutos * 60
        : 15 * 60;
    const [tiempoRestante, setTiempoRestante] = useState(duracionSegundos);
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [loading, setLoading] = useState(true);
    const [indice, setIndice] = useState(0);
    const [respuestaVisible, setRespuestaVisible] = useState(false);
    const autoFinalizadoRef = useRef(false);

    const etiquetas = useMemo(() => {
        const temas = searchParams.get("temas");
        if (!temas) return nombre ? [nombre] : [];
        return temas.split(",").map((e) => e.trim()).filter(Boolean);
    }, [nombre, searchParams]);

    const dificultades = useMemo(() => {
        const raw = searchParams.get("dificultades");
        if (!raw) return undefined;

        try {
            return JSON.parse(raw) as Record<string, "Facil" | "Intermedio" | "Avanzado">;
        } catch (error) {
            console.error("No se pudieron parsear las dificultades seleccionadas", error);
            return undefined;
        }
    }, [searchParams]);

    useEffect(() => {
        setTiempoRestante(duracionSegundos);
        autoFinalizadoRef.current = false;
    }, [duracionSegundos]);

    useEffect(() => {
        if (tiempoRestante <= 0 || quizFinalizado) return;

        const interval = window.setInterval(() => {
            setTiempoRestante((prev) => {
                if (prev <= 1) {
                    window.clearInterval(interval);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [tiempoRestante, quizFinalizado]);

    useEffect(() => {
        if (tiempoRestante > 0 || preguntas.length === 0 || quizFinalizado || autoFinalizadoRef.current) {
            return;
        }

        autoFinalizadoRef.current = true;
        void onFinalizarQuiz(preguntas, {
            elapsedSeconds: duracionSegundos - tiempoRestante,
            totalSeconds: duracionSegundos,
        });
    }, [duracionSegundos, onFinalizarQuiz, preguntas, quizFinalizado, tiempoRestante]);

    useEffect(() => {
        if (etiquetas.length === 0) {
            setPreguntas([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const cargar = async () => {
            try {
                const datos = etiquetas.length === 1 && nombre
                    ? await obtenerEtiquetaConPregunta(etiquetas[0], dificultades)
                    : await obtenerPreguntasPorEtiquetas(etiquetas, dificultades);
                const preguntasMezcladas = mezclarPreguntas(datos);
                setPreguntas(preguntasMezcladas);
                setIndice(0);
                setRespuestaVisible(false);
                onPreguntasCargadas?.(preguntasMezcladas);
                onCambioTema?.();
                autoFinalizadoRef.current = false;
            } catch (err) {
                console.error("Error al obtener preguntas", err);
                setPreguntas([]);
            } finally {
                setLoading(false);
            }
        };
        void cargar();
    }, [dificultades, etiquetas, nombre, onCambioTema, onPreguntasCargadas]);

    useEffect(() => {
        if (
            preguntas.length === 0 ||
            quizFinalizado ||
            finalizando ||
            autoFinalizadoRef.current ||
            Object.keys(evaluaciones).length !== preguntas.length
        ) {
            return;
        }

        autoFinalizadoRef.current = true;
        void onFinalizarQuiz(preguntas, {
            elapsedSeconds: duracionSegundos - tiempoRestante,
            totalSeconds: duracionSegundos,
        });
    }, [duracionSegundos, evaluaciones, finalizando, onFinalizarQuiz, preguntas, quizFinalizado, tiempoRestante]);

    const anterior = () => {
        if (indice > 0) {
            setRespuestaVisible(false);
            setIndice(indice - 1);
        }
    };

    if (loading) return <div className="text-[var(--text-primary)]">Cargando...</div>;
    if (etiquetas.length === 0) return <EstadoVacio titulo="No has seleccionado ningun tema" />;
    if (preguntas.length === 0) return <EstadoVacio titulo="No hay preguntas" subtitulo={`Temas: ${etiquetas.join(", ")}`} />;

    const actual = preguntas[indice];
    const temasActuales = (actual.Etiqueta ?? actual.etiquetas ?? []).map((e) =>
        typeof e === "string" ? e : e.nombre
    );
    const minutosRestantes = Math.floor(tiempoRestante / 60);
    const segundosRestantes = tiempoRestante % 60;
    const tiempoFormateado = `${String(minutosRestantes).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;
    const tiempoCritico = tiempoRestante > 0 && tiempoRestante <= 60;
    const respuestaActual = respuestas[actual.id] ?? "";
    const yaFueEvaluada = Boolean(preguntasEvaluadas[actual.id]);
    const esUltimaPregunta = indice === preguntas.length - 1;

    const handleBotonPrincipal = () => {
        if (!respuestaVisible) {
            setRespuestaVisible(true);
            if (!yaFueEvaluada) {
                void onEvaluarPregunta(actual);
            }
            return;
        }

        if (!esUltimaPregunta) {
            setRespuestaVisible(false);
            setIndice((prev) => prev + 1);
        }
    };

    return (
        <div className="w-11/12 max-w-5xl border border-[var(--border-default)] rounded-lg p-5 sm:p-10 flex flex-col gap-8 text-[var(--text-body)]">
            <header className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
                        {etiquetas.map((e) => (
                            <span key={e} className="rounded-full border border-[var(--border-default)] px-3 py-1">{e}</span>
                        ))}
                    </div>
                    <div className={`flex flex-row border px-4 py-3 text-right ${tiempoRestante === 0
                        ? "border-red-500/60 text-red-400"
                        : tiempoCritico
                            ? "border-amber-500/60 text-amber-300"
                            : "border-[var(--border-default)] text-[var(--text-primary)]"
                        }`}>
                        <p className="mt-1 font-mono text-2xl font-bold">{tiempoFormateado}</p>
                    </div>
                </div>
                <progress className="w-full h-2" value={indice + 1} max={preguntas.length} />
                <div className="flex flex-col gap-1 text-sm text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
                    <span>Pregunta {indice + 1} de {preguntas.length}</span>
                    <span>{duracionMinutos} MIN.</span>
                </div>
                {tiempoRestante === 0 && (
                        <p className="text-sm text-red-400">
                            El tiempo del test se agoto. Se genera el analisis final automaticamente.
                        </p>
                    )}
            </header>

            <section className="border border-[var(--border-default)] rounded-lg p-5 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest text-[var(--color-primary)]">
                    {temasActuales.map((t) => <span key={t}>{t}</span>)}
                </div>
                <h2 className="text-xl">{actual.pregunta}</h2>
            </section>

            <section className="border border-[var(--border-default)] rounded-lg p-4">
                <textarea
                    value={respuestaActual}
                    onChange={(e) => onRespuestaChange(actual.id, e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleBotonPrincipal();
                        }
                    }}
                    placeholder="Escribe tu respuesta"
                    rows={4}
                    disabled={quizFinalizado || finalizando}
                    className="text-xl w-full placeholder:text-[var(--placeholder)] placeholder:italic resize-none bg-transparent text-[var(--text-body)] disabled:opacity-70"
                />
            </section>

            <section key={actual.id} className="border border-[var(--border-default)] rounded-lg p-5">
                <p className={respuestaVisible ? "" : "blur-md select-none"}>
                    {actual.respuesta}
                </p>
            </section>

            <nav className="flex flex-col gap-4 text-center">
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={anterior}
                        disabled={indice === 0 || finalizando}
                        className={`flex-1 ${BOTON} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Anterior
                    </button>
                    <button
                        type="button"
                        onClick={handleBotonPrincipal}
                        disabled={finalizando || quizFinalizado || (respuestaVisible && esUltimaPregunta)}
                        className={`flex-1 ${BOTON} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {!respuestaVisible ? "Mostrar respuesta" : "Siguiente"}
                    </button>
                </div>
                <button type="button" onClick={() => navigate("/")} className={BOTON}>
                    Volver al menu principal
                </button>
            </nav>
        </div>
    );
}

export default PreguntasEtiqueta;
