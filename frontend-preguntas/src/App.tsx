import { Routes, Route } from 'react-router-dom'
import './style/index.css';
import PreguntasEtiqueta from './pages/PreguntasEtiqueta';
import Home from './pages/Home';
import Layout from './layout/Layout';

function App() {
  return (
    <div className='bg-black w-full min-h-screen flex justify-center items-center gap-3 flex-col  '>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/pregunta/:nombre' element={<PreguntasEtiqueta />} />
        </Route>
      </Routes>

    </div>
  )
}

export default App
