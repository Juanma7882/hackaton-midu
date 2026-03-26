import Buscador from '../component/Buscador'
import { useState, useEffect } from 'react'
import useDebounce from '../hooks/useDebounce'
import Tarjetas from '../component/Tarjetas'
import { useNavigate } from 'react-router-dom'

function Home() {
    const [buscar, setBuscar] = useState<string>("")
    const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([])
    const buscarDebounced = useDebounce<string>(buscar, 300);
    const navigate = useNavigate()

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

    const toggleEtiqueta = (nombreEtiqueta: string) => {
        setEtiquetasSeleccionadas((prev) => (
            prev.includes(nombreEtiqueta)
                ? prev.filter((etiqueta) => etiqueta !== nombreEtiqueta)
                : [...prev, nombreEtiqueta]
        ))
    }

    const irAPreguntas = () => {
        const searchParams = new URLSearchParams({
            temas: etiquetasSeleccionadas.join(',')
        })

        navigate(`/preguntas?${searchParams.toString()}`)
    }

    return (
        <main className="flex flex-col items-center p-4 md:p-8 m-0 w-full min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-mono">
            {/* Header / Hero Section */}
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
                className={`w-full max-w-6xl flex flex-col gap-10 items-center transition-all duration-700 ${showSelector ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none hidden'}`}
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

                {/* Cards Section */}
                <div className="w-full flex flex-col gap-4">
                    <div className="text-[var(--text-muted)] text-sm font-bold tracking-widest uppercase border-b border-[var(--border-default)] pb-2 inline-block max-w-fit">
                        // SELECCIÓN_DE_TARGETS
                    </div>
                    <div className='grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                        <Tarjetas
                            filtro={buscarDebounced}
                            etiquetasSeleccionadas={etiquetasSeleccionadas}
                            onToggleEtiqueta={toggleEtiqueta}
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 mb-16 flex flex-col items-center gap-4">
                    <div className="text-[var(--text-muted)] text-sm font-medium">
                        [{etiquetasSeleccionadas.length}] MÓDULOS_CARGADOS
                    </div>
                    <button
                        type='button'
                        onClick={irAPreguntas}
                        disabled={etiquetasSeleccionadas.length === 0}
                        className="group relative cursor-pointer text-xl md:text-2xl px-10 py-4 rounded-sm bg-[var(--bg-page)] font-bold tracking-widest transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:scale-100 disabled:hover:shadow-none text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black hover:shadow-[0_0_25px_rgba(33,255,0,0.8)] hover:-translate-y-1 overflow-hidden"
                    >
                        <span className="relative z-10">&gt; INICIAR_EVALUACIÓN</span>
                        <div className="absolute inset-0 bg-[var(--color-primary)] opacity-0 group-hover:opacity-20 transition-opacity blur-md pointer-events-none"></div>
                    </button>
                </div>
            </section>
        </main>
    )
}

export default Home
