import { useEffect, useState } from "react";
import { obtenerMazoEspecifico, type Pregunta } from "../../api/apis";
import { useNavigate } from "react-router-dom";
import { useQuizStore } from "../../store/useQuizStore";

interface PreguntasEtiquetaProps {
    onEvaluar?: (pregunta: Pregunta, respuestaUsuario: string) => void | Promise<void>;
    onCambioPregunta?: () => void;
}

const BOTON = "cursor-pointer border border-[var(--border-default)] hover:border-[var(--border-accent)] px-5 py-3 rounded-lg transition-colors text-[var(--text-primary)]";

function EstadoVacio({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
    const navigate = useNavigate();
    return (
        <div className="w-11/12 max-w-3xl border border-[var(--border-default)] p-8 text-center flex flex-col gap-6 text-[var(--text-primary)]">
            <h2 className="text-2xl md:text-3xl">{titulo}</h2>
            {subtitulo && <p className="text-[var(--text-secondary)]">{subtitulo}</p>}
            <button type="button" onClick={() => navigate("/")} className={BOTON}>
                Volver al menú principal
            </button>
        </div>
    );
}

function PreguntasEtiqueta({ onEvaluar, onCambioPregunta }: PreguntasEtiquetaProps) {
    const [respuesta, setRespuesta] = useState<string>("");
    const navigate = useNavigate();

    const mazoId = useQuizStore((state) => state.mazoId);
    const dificultad = useQuizStore((state) => state.dificultad);
    const etiquetasSeleccionadas = useQuizStore((state) => state.etiquetasSeleccionadas);

    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [loading, setLoading] = useState(true);
    const [indice, setIndice] = useState(0);
    const [respuestaVisible, setRespuestaVisible] = useState(false);

    const handleClickRespuesta = async () => {
        setRespuestaVisible((prev) => !prev);

        if (!respuestaVisible) {
            await onEvaluar?.(actual, respuesta);
        }
    };

    useEffect(() => {
        if (!mazoId) return
        const cargar = async () => {
            try {
                const mazoConDiezPreguntas = await obtenerMazoEspecifico(mazoId, dificultad, etiquetasSeleccionadas);
                setPreguntas(mazoConDiezPreguntas.preguntas);
                setIndice(0);
                setRespuesta("");
                setRespuestaVisible(false);
                onCambioPregunta?.();
            } catch (err) {
                console.error("Error al obtener preguntas", err);
                setPreguntas([]);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [mazoId, dificultad, etiquetasSeleccionadas]);

    const anterior = () => {
        if (indice > 0) {
            setRespuestaVisible(false);
            setRespuesta("");
            setIndice(indice - 1);
            onCambioPregunta?.();
        }
    };
    const siguiente = () => {
        if (indice < preguntas.length - 1) {
            setRespuestaVisible(false);
            setRespuesta("");
            setIndice(indice + 1);
            onCambioPregunta?.();
        }
    };

    if (loading) return <div className="text-[var(--text-primary)]">Cargando...</div>;
    if (!mazoId) {
        return <EstadoVacio titulo="No seleccionaste ningún mazo" />;
    }

    if (preguntas.length === 0) {
        return <EstadoVacio titulo="No hay preguntas disponibles" />;
    }
    const actual = preguntas[indice];
    const temasActuales = (actual.Etiqueta ?? actual.etiquetas ?? []).map((e) => e.nombre);
    return (
        <div className="w-11/12 max-w-5xl border border-[var(--border-default)] rounded-lg p-5 sm:p-10 flex flex-col gap-8 text-[var(--text-body)]">
            <header className="flex flex-col gap-4">
                {/* <div className="flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
                    {preguntas.map((e) => (
                        <span key={e} className="rounded-full border border-[var(--border-default)] px-3 py-1">{e}</span>
                    ))}
                </div> */}
                <progress className="w-full h-2" value={indice + 1} max={preguntas.length} />
                <span className="text-sm text-[var(--text-muted)]">Pregunta {indice + 1} de {preguntas.length}</span>
            </header>

            <section className="border border-[var(--border-default)] rounded-lg p-5 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest text-[var(--color-primary)]">
                    {temasActuales.map((t) => <span key={t}>{t}</span>)}
                </div>
                <h2 className="text-xl">{actual.pregunta}</h2>
            </section>

            <section className="border border-[var(--border-default)] rounded-lg p-4">
                <textarea
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder="Escribe tu respuesta"
                    rows={3}
                    className="text-xl w-full placeholder:text-[var(--placeholder)] placeholder:italic resize-none bg-transparent text-[var(--text-body)]"
                />
            </section>

            <section className="border border-[var(--border-default)] rounded-lg p-5">
                <p className={`transition-all duration-500 ${respuestaVisible ? "" : "blur-md select-none"}`}>
                    {actual.respuesta}
                </p>
            </section>

            <nav className="flex flex-col gap-4 text-center">
                <button type="button" onClick={() => handleClickRespuesta()} className={BOTON}>
                    {respuestaVisible ? "Ocultar respuesta" : "Mostrar respuesta"}
                </button>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={anterior}
                        disabled={indice === 0}
                        className={`flex-1 ${BOTON} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Anterior
                    </button>
                    <button
                        type="button"
                        onClick={siguiente}
                        disabled={indice === preguntas.length - 1}
                        className={`flex-1 ${BOTON} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Siguiente
                    </button>
                </div>
                <button type="button" onClick={() => navigate("/")} className={BOTON}>
                    Volver al menú principal
                </button>
            </nav>
        </div>
    );
}

export default PreguntasEtiqueta;
