export const COLORES_ETIQUETA: Record<string, string> = {
    javascript: "bg-yellow-400/10 text-yellow-400 border-yellow-400/40 dark:text-yellow-300",
    typescript: "bg-blue-400/20 text-blue-600 border-blue-400/40 dark:text-blue-300",
    python: "bg-green-400/20 text-green-600 border-green-400/40 dark:text-green-300",
    rust: "bg-orange-400/20 text-orange-600 border-orange-400/40 dark:text-orange-300",
    go: "bg-cyan-400/20 text-cyan-600 border-cyan-400/40 dark:text-cyan-300",
    java: "bg-red-400/20 text-red-600 border-red-400/40 dark:text-red-30₀",
    css: "bg-pink-4₀/2₀ text-pink-6₀ border-pink-4₀/4₀ dark:text-pink-3₀",
    html: "bg-orange-500/20 text-orange-600 border-orange-500/40 dark:text-orange-300",
    csharp: "bg-purple-400/20 text-purple-600 border-purple-400/40 dark:text-purple-300",
    react: "bg-blue-400/20 text-blue-600 border-blue-400/40 dark:text-blue-300",
    sql: "bg-gray-400/20 text-gray-600 border-gray-400/40 dark:text-gray-300",
};

export const COLOR_ETIQUETA_DEFAULT = "bg-zinc-400/20 text-zinc-600 border-zinc-400/40 dark:text-zinc-300";

export function getColorEtiqueta(nombre: string): string {
    const clave = nombre.toLowerCase().replace("#", "sharp").replace("+", "");
    return COLORES_ETIQUETA[clave] ?? COLOR_ETIQUETA_DEFAULT;
}