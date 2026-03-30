import Buscador from '../component/Buscador'
import { useEffect, useMemo, useState } from 'react'
import useDebounce from '../hooks/useDebounce'
import Tarjetas from '../component/Tarjetas'
import { obtenerMazo, type Mazo } from '../api/apis'
import { getColorEtiqueta } from '../constans/etiquetaColores'

function Home() {
    const [buscar, setBuscar] = useState<string>("")
    const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([])
    const buscarDebounced = useDebounce<string>(buscar, 300);
    const [mazos, setMazos] = useState<Mazo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);



    useEffect(() => {
        const cargarEtiquetas = async () => {
            try {
                const data = await obtenerMazo();
                setMazos(data.mazos);
            } catch (error) {
                console.error("Error al obtener las etiquetas:", error);
            }
            finally {
                setLoading(false);
            }
        };
        cargarEtiquetas();
    }, []);


    // 1. Extraer etiquetas únicas de todos los mazos
    const etiquetasUnicas = useMemo(() => {
        const todas = mazos.flatMap((mazo) => mazo.etiquetas);
        const unicas = new Map(todas.map((e) => [e.id, e]));
        return Array.from(unicas.values());
    }, [mazos]);

    // 2. Filtrar mazos según etiquetas seleccionadas
    const mazosFiltradosPorEtiqueta = useMemo(() => {
        if (etiquetasSeleccionadas.length === 0) return mazos;
        return mazos.filter((mazo) =>
            mazo.etiquetas.some((e) => etiquetasSeleccionadas.includes(e.nombre))
        );
    }, [mazos, etiquetasSeleccionadas]);

    const texto1 = "Plataforma interactiva de pruebas técnicas."
    const texto2 = "Selecciona los módulos a cargar y ejecuta el test de evaluación para comprobar tus habilidades en código."

    const [typedText1, setTypedText1] = useState("")
    const [typedText2, setTypedText2] = useState("")
    const [typing1Complete, setTyping1Complete] = useState(false)
    const [typing2Complete, setTyping2Complete] = useState(false)

    const [showSelector, setShowSelector] = useState<boolean>(false)
    const [showDescription, setShowDescription] = useState<boolean>(true)


    useEffect(() => {
        if (!typing1Complete || !typing2Complete) return;
        const hideDescriptionTimeout = setTimeout(() => {
            setShowDescription(false)
        }, 300)
        const showSelectorTimeout = setTimeout(() => {
            setShowSelector(true)
        }, 900)
        return () => {
            clearTimeout(hideDescriptionTimeout)
            clearTimeout(showSelectorTimeout)
        }
    }, [typing1Complete, typing2Complete])


    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i <= texto1.length) {
                setTypedText1(texto1.slice(0, i));
                i++;
            } else {
                clearInterval(interval);
                setTyping1Complete(true);
            }
        }, 30);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!typing1Complete) return;
        let i = 0;
        const interval = setInterval(() => {
            if (i <= texto2.length) {
                setTypedText2(texto2.slice(0, i));
                i++;
            } else {
                clearInterval(interval);
                setTyping2Complete(true)
            }
        }, 20);
        return () => clearInterval(interval);
    }, [typing1Complete]);

    const toggleEtiqueta = (idEtiqueta: string) => {
        setEtiquetasSeleccionadas((prev) => (
            prev.includes(idEtiqueta)
                ? prev.filter((id) => id !== idEtiqueta)
                : [...prev, idEtiqueta]
        ))
    }





    return (
        <>
            <div className='text-3xl pt-8 md:text-5xl font-bold tracking-tight drop-shadow-[0_0_15px_rgba(33,255,0,0.4)] font-mono'> <span className="text-[var(--text-primary)]">Interview</span>
                <span className="text-[var(--color-primary)]">_Quiz</span>
            </div>
            <main className="flex flex-col items-center p-4 md:p-8 m-0 w-full min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-mono">
                <div className="absolute inset-0 bg-[var(--color-primary)] opacity-5 blur-[100px] pointer-events-none"></div>
                <div
                    className={`w-full max-w-5xl transition-all duration-700 overflow-hidden ${showDescription ? 'opacity-100 translate-y-0 max-h-96' : 'opacity-0 -translate-y-2 max-h-0 pointer-events-none'}`}
                >

                    <div className="text-[var(--text-secondary)] text-left text-2xl md:text-2xl w-full max-w-5xl font-light bg-black/50 p-6 rounded border border-[var(--border-default)] shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                        <p className="min-h-[1.75rem]">
                            <span className="text-[var(--color-primary)] font-bold mr-2">~ ❯</span>
                            {typedText1}
                            {!typing1Complete && <span className="inline-block w-2 h-5 bg-[var(--color-primary)] animate-pulse ml-1 align-middle"></span>}
                        </p>
                        <p className="min-h-[1.75rem] mt-2">
                            {typing1Complete && (
                                <>
                                    <span className="text-[var(--color-primary)] font-bold mr-2">~ ❯</span>
                                    {typedText2}
                                    {typedText2.length < texto2.length && <span className="inline-block w-2 h-5 bg-[var(--color-primary)] animate-pulse ml-1 align-middle"></span>}
                                    {typedText2.length === texto2.length && <span className="inline-block w-2 h-5 bg-[var(--color-primary)] animate-pulse ml-1 align-middle"></span>}
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <section
                    className={`w-full max-w-6xl flex flex-col gap-3 items-center transition-all duration-700 ${showSelector ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none hidden'}`}
                >

                    {/* Search Bar Wrapper */}
                    <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col items-center gap-2">
                        <div className="text-[var(--color-primary)] text-sm font-bold tracking-widest uppercase self-start md:self-center w-full max-w-md opacity-80">
                            &gt; BÚSQUEDA_DE_MÓDULOS_
                        </div>
                        <div className="w-full max-w-md">
                            <Buscador buscar={buscar} setBuscar={setBuscar} />
                        </div>
                    </div>

                    {!loading && (
                        <div className="w-full flex flex-wrap justify-center gap-2">
                            {etiquetasUnicas.map((etiqueta) => {
                                const seleccionada = etiquetasSeleccionadas.includes(etiqueta.nombre);
                                return (
                                    <button
                                        key={etiqueta.id}
                                        type="button"
                                        onClick={() => toggleEtiqueta(etiqueta.nombre)}
                                        className={[
                                            "rounded-full border px-3 py-1 text-xs font-mono font-semibold tracking-wide transition-all duration-200 cursor-pointer",
                                            getColorEtiqueta(etiqueta.nombre),
                                            seleccionada
                                                ? `${getColorEtiqueta(etiqueta.nombre)} border-3 border-[var(--color-primary)] text-white`
                                                : `${getColorEtiqueta(etiqueta.nombre)}   text-[var(--text-muted)] `,
                                        ].join(" ")}
                                    >
                                        {(etiqueta.nombre)}
                                    </button>
                                );
                            })}
                        </div>
                    )}



                    {/* Cards Section */}

                    <div className="w-full flex flex-col gap-4 pt-6 md:mt-10">
                        <div className="text-[var(--text-muted)] text-sm font-bold tracking-widest uppercase border-b border-[var(--border-default)] pb-2 inline-block max-w-fit">
                            // SELECCIÓNA TU TARJETA Y NIVEL DE DIFICULTAD PARA INICIAR EL TEST
                        </div>
                        <div className='grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
                            <Tarjetas
                                mazos={mazosFiltradosPorEtiqueta}
                                loading={loading}
                                filtro={buscarDebounced}
                            />
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

export default Home
