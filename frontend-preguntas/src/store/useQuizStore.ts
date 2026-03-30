import { create } from "zustand";
import type { Mazo } from "../api/apis";

interface QuizState {
    mazoId: number;
    dificultad: string;
    etiquetasSeleccionadas: number[];
    mazo: Mazo | null;

    setQuiz: (data: {
        mazoId: number;
        dificultad: string;
        etiquetasSeleccionadas: number[];
        mazo: Mazo;
    }) => void;
}

export const useQuizStore = create<QuizState>((set) => ({
    mazoId: null,
    dificultad: "Facil",
    etiquetasSeleccionadas: [],
    mazo: null,

    setQuiz: (data) =>
        set((state) => ({
            ...state,
            ...data,
        })),
}));

