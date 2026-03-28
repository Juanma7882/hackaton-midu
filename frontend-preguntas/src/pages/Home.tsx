import Buscador from '../component/Buscador'
import { useEffect, useMemo, useState } from 'react'
import useDebounce from '../hooks/useDebounce'
import Tarjetas from '../component/Tarjetas'
import { useNavigate } from 'react-router-dom'
import { obtenerMazo, type Mazo } from '../api/apis'
import { getColorEtiqueta } from '../constans/etiquetaColores'

function Home() {
    const [buscar, setBuscar] = useState<string>("")
    const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([])
    const buscarDebounced = useDebounce<string>(buscar, 300);
    const navigate = useNavigate()
    const [mazos, setMazos] = useState<Mazo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);



    useEffect(() => {
        const cargarEtiquetas = async () => {
            try {
                const data = await obtenerMazo();
                setMazos(data.mazos);
                console.log(data.mazos);
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
        <div className="flex flex-col justify-center items-center gap-8 p-8 md:p-12  border-dotted w-11/12 max-w-7xl bg-[var(--bg-page)] border-[var(--border-default)]">
            <h1 className="text-2xl md:text-3xl md:text-5xl text-[var(--text-primary)]">Interview Quiz</h1>


            <div className='w-full flex justify-center items-center'>
                <Buscador buscar={buscar} setBuscar={setBuscar} />
            </div>

            {!buscarDebounced &&
                <h1 className="text-2xl md:text-3xl text-[var(--text-primary)]"></h1>
            }
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
                                    "rounded-full border px-3 py-1 text-xs font-mono font-semibold tracking-wide transition-all",
                                    getColorEtiqueta(etiqueta.nombre),
                                    seleccionada
                                        ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white border"
                                        : " border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--text-primary)] border-none",
                                ].join(" ")}
                            >
                                {(etiqueta.nombre)}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="w-full flex flex-wrap items-center justify-center gap-3 text-sm md:text-base text-[var(--text-secondary)]">
                <span className="uppercase tracking-[0.2em] text-[var(--text-muted)]"></span>

            </div>
            <div className='grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
                <Tarjetas
                    mazos={mazosFiltradosPorEtiqueta}
                    loading={loading}
                    filtro={buscarDebounced}
                />
            </div>
        </div>
    )
}

export default Home
