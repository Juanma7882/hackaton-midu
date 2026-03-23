import type { Etiqueta } from "../api/apis";

export default function TarjetaComponent({ etiqueta }: { etiqueta: Etiqueta }) {
    return (
        <>
        {/*<div className='w-24 md:w-40'>
            <img className='w-full h-full' src={etiqueta.pathCompletoUrl} alt={etiqueta.nombre} />
        </div>
        */}
        <div>
            <h2 className='text-white text-2xl md:text-3xl border-2 border-dotted border-white py-4 px-2 text-center rounded-md hover:border-gray-600 cursor-pointer'>{etiqueta.nombre}</h2>   
        </div>
        </>
    )
}