import Buscador from '../component/Buscador'
import Tarjeta from '../component/Tarjeta'
import '../style/index.css'
import { useState } from 'react'
import useDebounce from '../hooks/useDebounce'

function App() {
    const [buscar, setBuscar] = useState<string>("")
    const buscarDebounced = useDebounce<string>(buscar, 300);

    return (
        <div className='bg-black w-full min-h-screen flex justify-center items-center gap-3 flex-col p-10'>
            <div className='w-full flex justify-center items-center mt-5 pt-32 pb-32'>
                <Buscador buscar={buscar} setBuscar={setBuscar} />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                <Tarjeta filtro={buscarDebounced} />
            </div>
        </div>
    )
}

export default App