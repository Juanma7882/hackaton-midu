function normalizarApiBaseUrl(value?: string): string {
  const rawValue = value?.trim();

  if (!rawValue) {
    return "/api/";
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue.endsWith("/") ? rawValue : `${rawValue}/`;
  }

  const withoutLeadingDots = rawValue.replace(/^\.?\//, "");
  const rootRelativeValue = rawValue.startsWith("/") ? rawValue : `/${withoutLeadingDots}`;

  return rootRelativeValue.endsWith("/") ? rootRelativeValue : `${rootRelativeValue}/`;
}

const API_BASE_URL = normalizarApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const API_BASE = new URL(API_BASE_URL, window.location.origin);

function construirApiUrl(path: string): string {
  return new URL(path, API_BASE).toString();
}

const API_URLS = {
  etiquetas: construirApiUrl("etiquetas"),
  preguntas: construirApiUrl("preguntas"),
  etiquetaPreguntas: construirApiUrl("tarjetaEtiquetas"),
  evaluaciones: construirApiUrl("evaluaciones"),
  mazos: construirApiUrl("mazo"),
};

function construirUrlAsset(path: string): string {
  return new URL(path, API_BASE).toString();
}

// =======================
// Cliente HTTP genérico
// =======================
async function consumirApi<T>(url: string, options?: RequestInit): Promise<T> {
  const respuesta = await fetch(url, options);
  if (!respuesta.ok) {
    throw new Error(`Error HTTP: ${respuesta.status}`);
  }

  return respuesta.json() as Promise<T>;
}

// async function consumirApiConBody<T>(url: string, init: RequestInit): Promise<T> {
//   const respuesta = await fetch(url, {
//     headers: {
//       "Content-Type": "application/json",
//       ...(init.headers ?? {}),
//     },
//     ...init,
//   });

//   if (!respuesta.ok) {
//     throw new Error(`Error HTTP: ${respuesta.status}`);
//   }
//   console.log(respuesta.json())
//   return respuesta.json();
// }

// =======================
// Tipos (ejemplo)
// =======================

export interface Pregunta {
  id: number;
  pregunta: string;
  respuesta: string;
  dificultad: "Facil" | "Intermedio" | "Avanzado";
  etiquetas?: Etiqueta[];
  /** Formato de la API tarjetaEtiquetas */
  Etiqueta?: Array<{ nombre: string }>;
}

export type Dificultad = "Facil" | "Intermedio" | "Avanzado";


export interface ApiResponse<T> {
  success: boolean;
  message: string;
  count: number;
  data: T;
  error: string | null;
}


// =======================
// Relación intermedia
export interface MazoEtiqueta {
  id: number;
  opcional: boolean;
}

// =======================
export interface Etiqueta {
  id: number;
  nombre: string;
  url?: string;
  pathCompletoUrl?: string;
  MazoEtiquetas?: MazoEtiqueta;
}

// =======================
export interface Mazo {
  id: number;
  nombre: string;
  descripcion: string;
  url: string;
  etiquetas: Etiqueta[];
}

// =======================
export interface MazosResponse {
  total: number;
  mazos: Mazo[];
}
// =======================
// Funciones de API
// =======================



async function obtenerMazo(): Promise<MazosResponse> {
  try {
    const apiResponse = await consumirApi<MazosResponse>(API_URLS.mazos);
    return apiResponse;
  } catch (error) {
    console.error("Error al obtener el mazo", error);
    throw error;
  }
}

async function obtenerEtiquetas(): Promise<Etiqueta[]> {
  try {
    const ApiResponse = await consumirApi<ApiResponse<Etiqueta[]>>(API_URLS.etiquetas);
    return ApiResponse.data;
  } catch (error) {
    console.error("Error al obtener etiquetas", error);
    throw error;
  }
}

async function obtenerPreguntas(): Promise<Pregunta[]> {
  try {
    return await consumirApi<Pregunta[]>(API_URLS.preguntas);
  } catch (error) {
    console.error("Error al obtener preguntas", error);
    throw error;
  }
}

async function obtenerEtiquetaConPregunta(
  etiqueta: string,
  dificultades?: Record<string, Dificultad>
): Promise<Pregunta[]> {
  try {
    const query = dificultades ? `?dificultades=${encodeURIComponent(JSON.stringify(dificultades))}` : "";
    const url = `${API_URLS.etiquetaPreguntas}/${etiqueta}${query}`;
    const rsp = await consumirApi<ApiResponse<Pregunta[]>>(url);
    return rsp.data;
  } catch (error) {
    console.error("Error al obtener etiquetas con preguntas", error);
    throw error;
  }
}

async function obtenerPreguntasPorEtiquetas(
  etiquetas: string[],
  dificultades?: Record<string, Dificultad>
): Promise<Pregunta[]> {
  try {
    const params = new URLSearchParams({ etiquetas: etiquetas.join(",") });
    if (dificultades) {
      params.set("dificultades", JSON.stringify(dificultades));
    }
    const url = `${API_URLS.etiquetaPreguntas}?${params.toString()}`;
    const rsp = await consumirApi<ApiResponse<Pregunta[]>>(url);
    return rsp.data;
  } catch (error) {
    console.error("Error al obtener preguntas por etiquetas", error);
    throw error;
  }
}

// =======================
// Evaluaciones (OpenRouter)
// =======================
export interface PreguntaAEvaluar {
  preguntaId: number;
  pregunta: string;
  respuestaCorrecta: string;
  respuestaUsuario: string;
  etiquetas?: string[];
}

export interface OpenRouterChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  reasoning_details?: unknown;
}

export interface OpenRouterStreamEvent {
  type: "meta" | "message" | "done" | "error";
  data: unknown;
}

export interface Evaluacion {
  preguntaId: number;
  puntuacion: number;
  esCorrecta: boolean;
  feedback: string;
  mejoras: string[];
  pregunta?: string;
}

export interface QuizOverview {
  puntuacionGeneral: number;
  resumen: string;
  fortalezas: string[];
  cosasParaMejorar: string[];
  temasARepasar: string[];
  consejosGenerales: string[];
  evaluaciones: Evaluacion[];
  modelo: string;
  procesadoLocal: boolean;
}

interface ResultadoEvaluacion {
  modelo: string;
  evaluaciones: Evaluacion[];
  uso?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

interface ResumenQuizPayload {
  preguntas: PreguntaAEvaluar[];
}

async function evaluarRespuestas(preguntas: PreguntaAEvaluar[]): Promise<ResultadoEvaluacion> {
  const url = `${API_URLS.evaluaciones}/openrouter`;
  const rsp = await consumirApi<{ success: boolean; data: ResultadoEvaluacion }>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preguntas }),
  });
  if (!rsp.success) throw new Error("Error en la evaluación");
  return rsp.data;
}

async function generarResumenQuiz(payload: ResumenQuizPayload): Promise<QuizOverview> {
  const url = `${API_URLS.evaluaciones}/openrouter/resumen-quiz`;
  const rsp = await consumirApi<{ success: boolean; data: QuizOverview }>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!rsp.success) throw new Error("Error al generar el resumen del quiz");
  return rsp.data;
}

async function crearStreamOpenRouter(
  messages: OpenRouterChatMessage[],
  onEvent: (event: OpenRouterStreamEvent) => void,
  options?: { model?: string; temperature?: number; signal?: AbortSignal }
): Promise<void> {
  const url = `${API_URLS.evaluaciones}/openrouter/stream`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model: options?.model,
      temperature: options?.temperature,
    }),
    signal: options?.signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`No se pudo abrir el stream: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const emitirEvento = (bloque: string) => {
    const lines = bloque
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean);

    let eventType = "message";
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
      }

      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (dataLines.length === 0) {
      return;
    }

    const payload = dataLines.join("\n");

    if (payload === "[DONE]") {
      onEvent({ type: "done", data: null });
      return;
    }

    try {
      onEvent({
        type: (eventType === "meta" || eventType === "error") ? eventType : "message",
        data: JSON.parse(payload),
      });
    } catch {
      onEvent({
        type: (eventType === "meta" || eventType === "error") ? eventType : "message",
        data: payload,
      });
    }
  };

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      emitirEvento(block);
    }
  }

  if (buffer.trim()) {
    emitirEvento(buffer);
  }
}

export {
  construirUrlAsset,
  crearStreamOpenRouter,
  obtenerEtiquetas,
  obtenerPreguntas,
  obtenerEtiquetaConPregunta,
  obtenerPreguntasPorEtiquetas,
  evaluarRespuestas,
  generarResumenQuiz,
  obtenerMazo,
};
