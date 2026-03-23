import { Routes, Route } from 'react-router-dom'
import './style/index.css';
import PreguntasEtiqueta from './pages/PreguntasEtiqueta';
import Home from './pages/Home';

function App() {
  return (
    <div className='bg-black w-full min-h-screen flex justify-center items-center gap-3 flex-col  '>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/pregunta/:nombre' element={<PreguntasEtiqueta />} />
      </Routes>

    </div>
  )
}

export default App
