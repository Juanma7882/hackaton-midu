import Buscador from '../component/Buscador'
import '../style/index.css'
import { useState } from 'react'
import useDebounce from '../hooks/useDebounce'
import Tarjetas from '../component/Tarjetas'
import { useNavigate } from 'react-router-dom'

function Home() {
    const [buscar, setBuscar] = useState<string>("")
    const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([])
    const buscarDebounced = useDebounce<string>(buscar, 300);
    const navigate = useNavigate()

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
        <div className='bg-black flex flex-col justify-center items-center gap-8 p-8 md:p-12 border-2 border-dotted border-white w-11/12 max-w-7xl'>
            <div className='w-full flex justify-center items-center'>
                <Buscador buscar={buscar} setBuscar={setBuscar} />
            </div>
            {!buscarDebounced &&
                <h1 className='text-white text-2xl md:text-3xl'>Selecciona las etiquetas que te interesan para ver las preguntas</h1>
            }
            <div className='w-full flex flex-wrap items-center justify-center gap-3 text-sm md:text-base text-white/80'>
                <span className='uppercase tracking-[0.2em] text-white/60'>Seleccionadas</span>
                <span>{etiquetasSeleccionadas.length}</span>
                {etiquetasSeleccionadas.length > 0 && (
                    <span className='text-center text-white/60'>
                        {etiquetasSeleccionadas.join(' - ')}
                    </span>
                )}
            </div>
            <div className='grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Tarjetas
                    filtro={buscarDebounced}
                    etiquetasSeleccionadas={etiquetasSeleccionadas}
                    onToggleEtiqueta={toggleEtiqueta}
                />
            </div>
            <button
                type='button'
                onClick={irAPreguntas}
                disabled={etiquetasSeleccionadas.length === 0}
                className='cursor-pointer text-white text-xl md:text-2xl border border-cyan-400 px-6 py-3 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-cyan-400/10'
            >
                Ir a las preguntas
            </button>
        </div>
    )
}

export default Home
