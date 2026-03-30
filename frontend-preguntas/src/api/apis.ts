const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Falta definir VITE_API_BASE_URL");
}

const API_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

const API_URLS = {
  etiquetas: `${API_BASE_URL}etiquetas`,
  preguntas: `${API_BASE_URL}preguntas`,
  etiquetaPreguntas: `${API_BASE_URL}tarjetaEtiquetas`,
  evaluaciones: `${API_BASE_URL}evaluaciones`,
  mazos: `${API_BASE_URL}mazo`,
  mazoEspecifico: `${API_BASE_URL}mazo`
};

function construirUrlAsset(path: string): string {
  return new URL(path, API_ORIGIN).toString();
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
  etiquetas?: Etiqueta[];
  /** Formato de la API tarjetaEtiquetas */
  Etiqueta?: Array<{ nombre: string }>;
  dificultad?: string;
}


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

export interface ObtenerMazoEspeficiforResponse {
  preguntas: Pregunta[];
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



async function obtenerMazoEspecifico(
  mazoId: number,
  dificultad: string,
  etiquetasId: number[]
): Promise<ObtenerMazoEspeficiforResponse> {
  try {
    const params = new URLSearchParams();

    params.append("dificultad", dificultad);

    etiquetasId.forEach((id) => {
      params.append("etiquetasSeleccionadas", String(id));
    });

    const urlCompleta = `${API_URLS.mazoEspecifico}/${mazoId}?${params.toString()}`;

    const apiResponse = await consumirApi<Etiqueta>(urlCompleta);
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

async function obtenerEtiquetaConPregunta(etiqueta: string): Promise<Pregunta[]> {
  try {
    const url = `${API_URLS.etiquetaPreguntas}/${etiqueta}`;
    const rsp = await consumirApi<ApiResponse<Pregunta[]>>(url);
    return rsp.data;
  } catch (error) {
    console.error("Error al obtener etiquetas con preguntas", error);
    throw error;
  }
}

async function obtenerPreguntasPorEtiquetas(etiquetas: string[]): Promise<Pregunta[]> {
  try {
    const url = `${API_URLS.etiquetaPreguntas}?etiquetas=${etiquetas.join(",")}`;
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
}

interface ResultadoEvaluacion {
  modelo: string;
  evaluaciones: Evaluacion[];
  uso?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
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
  obtenerMazo,
  obtenerMazoEspecifico,
};
