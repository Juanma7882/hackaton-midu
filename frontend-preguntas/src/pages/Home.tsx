import Buscador from '../component/Buscador'
import '../style/index.css'
import { useState } from 'react'
import useDebounce from '../hooks/useDebounce'
import Tarjetas from '../component/Tarjetas'

function Home() {
    const [buscar, setBuscar] = useState<string>("")
    const buscarDebounced = useDebounce<string>(buscar, 300);

    return (
        <div className='bg-black flex flex-col justify-center items-center gap-8 p-12 border-2 border-dotted border-white'>
            <div className='w-full flex justify-center items-center'>
                <Buscador buscar={buscar} setBuscar={setBuscar} />
            </div>
            {!buscarDebounced &&
                <h1 className='text-white text-2xl md:text-3xl'>Selecciona las etiquetas que te interesan para ver las preguntas</h1>
            }
            <div className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                <Tarjetas filtro={buscarDebounced} />
            </div>
            <button className='cursor-pointer text-white text-2xl md:text-3xl'>
                Estoy OK
            </button>
        </div>
    )
}

export default Home
