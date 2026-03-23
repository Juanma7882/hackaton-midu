import { useEffect, useState } from "react";
import { construirUrlAsset, obtenerEtiquetas, type Etiqueta } from "../api/apis";
import { useNavigate } from "react-router-dom";
import TarjetaComponent from "./TarjetaComponent";


export default function Tarjetas({ filtro }: { filtro: string }) {
    const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarEtiquetas = async () => {
            try {
                const data = await obtenerEtiquetas();
                setEtiquetas(data);
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener las etiquetas:", error);
                setLoading(false);
            }
        };
        cargarEtiquetas();
    }, []);
    if (loading === true) {
        console.log()
        return <div>Cargando...</div>;
    }
    const etiquetasFiltradas = etiquetas.filter((etiqueta) =>
        etiqueta.nombre.toLowerCase().includes(filtro.toLowerCase())
    );
    const etiquetasConImagenAñadida = etiquetasFiltradas.map(etiqueta => ({
        ...etiqueta,
        pathCompletoUrl: construirUrlAsset(etiqueta.url)
    }))
    if (filtro.length > 0 && etiquetasConImagenAñadida.length === 0) {
        return (
            <div className="text-white text-2xl md:text-3xl col-span-full">
                Ninguna etiqueta coincide con el filtro
            </div>
        );
    }

    return (
        <>
            {etiquetasConImagenAñadida.map((etiqueta) => (
                <div onClick={() => navigate(`/pregunta/${etiqueta.nombre}`)}
                    key={etiqueta.id}>
                    <TarjetaComponent etiqueta={etiqueta} />
                </div>
            ))}
        </>
    )
}
