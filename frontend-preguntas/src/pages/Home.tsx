import Buscador from '../component/Buscador'
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
        <section className="flex flex-col items-center p-4 md:p-6 m-0 w-full gap-4">
            <div className='w-full flex justify-center items-center'>
                <Buscador buscar={buscar} setBuscar={setBuscar} />
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
                className="cursor-pointer text-xl md:text-2xl px-6 py-1 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 text-[var(--text-primary)] border border-[var(--border-accent)] hover:bg-[var(--color-primary)]/10"
            >
                Estoy listo!
            </button>
        </section>
    )
}

export default Home
