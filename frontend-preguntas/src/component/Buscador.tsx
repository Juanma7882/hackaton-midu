

interface BuscadorProps {
    buscar: string
    setBuscar: (value: string) => void
}
export default function Buscador({ buscar, setBuscar }: BuscadorProps) {


    return (
        <div className="relative w-full max-w-md">
            <input
                type="search"
                placeholder="Buscar el tema de la entrevista..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--placeholder)] text-center border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
            />
            <svg
                className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--placeholder)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
            </svg>
        </div>
    )
}