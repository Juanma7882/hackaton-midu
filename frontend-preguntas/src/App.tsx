import { Routes, Route } from 'react-router-dom'
import './style/index.css';
import Home from './pages/Home';
import Layout from './layout/Layout';
import Preguntas from './pages/preguntas/Preguntas';

function App() {
  return (
    <div className="w-full min-h-screen flex justify-center items-center gap-3 flex-col bg-[var(--bg-page)]">
      <Routes>
        <Route path='/' element={<Home />} />
        <Route element={<Layout />}>
          <Route path='/preguntas' element={<Preguntas />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
