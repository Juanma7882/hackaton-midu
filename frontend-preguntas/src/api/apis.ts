const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Falta definir VITE_API_BASE_URL");
}

const API_ORIGIN = new URL(API_BASE_URL).origin;

const API_URLS = {
  etiquetas: `${API_BASE_URL}etiquetas`,
  preguntas: `${API_BASE_URL}preguntas`,
  etiquetaPreguntas: `${API_BASE_URL}tarjetaEtiquetas`,
  evaluarRespuestas: `${API_BASE_URL}evaluaciones/openrouter`,
};

function construirUrlAsset(path: string): string {
  return new URL(path, API_ORIGIN).toString();
}

async function consumirApi<T>(url: string): Promise<T> {
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`Error HTTP: ${respuesta.status}`);
  }

  return respuesta.json();
}

async function consumirApiConBody<T>(url: string, init: RequestInit): Promise<T> {
  const respuesta = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!respuesta.ok) {
    throw new Error(`Error HTTP: ${respuesta.status}`);
  }
  console.log(respuesta.json())
  return respuesta.json();
}

export interface Etiqueta {
  id: number;
  nombre: string;
  url: string;
}

export interface Pregunta {
  id: number;
  pregunta: string;
  respuesta: string;
  Etiqueta?: Array<Pick<Etiqueta, "nombre">>;
}

export interface PreguntaAEvaluar {
  preguntaId: number;
  pregunta: string;
  respuestaCorrecta: string;
  respuestaUsuario: string;
  etiquetas?: string[];
}

export interface EvaluacionPregunta {
  preguntaId: number;
  puntuacion: number;
  esCorrecta: boolean;
  feedback: string;
  mejoras?: string[];
}

export interface EvaluacionOpenRouterResponse {
  modelo: string;
  evaluaciones: EvaluacionPregunta[];
  uso?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  contenidoCrudo: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  count?: number;
  data: T;
  error: string | null;
}

async function obtenerEtiquetas(): Promise<Etiqueta[]> {
  try {
    const apiResponse = await consumirApi<ApiResponse<Etiqueta[]>>(API_URLS.etiquetas);
    return apiResponse.data;
  } catch (error) {
    console.error("Error al obtener etiquetas", error);
    throw error;
  }
}

async function obtenerPreguntas(): Promise<Pregunta[]> {
  try {
    const apiResponse = await consumirApi<ApiResponse<Pregunta[]>>(API_URLS.preguntas);
    return apiResponse.data;
  } catch (error) {
    console.error("Error al obtener preguntas", error);
    throw error;
  }
}

async function obtenerEtiquetaConPregunta(etiqueta: string): Promise<Pregunta[]> {
  try {
    const apiUrl = `${API_URLS.etiquetaPreguntas}/${encodeURIComponent(etiqueta)}`;
    const rsp = await consumirApi<ApiResponse<Pregunta[]>>(apiUrl);
    return rsp.data;
  } catch (error) {
    console.error("Error al obtener etiquetas con preguntas", error);
    throw error;
  }
}

async function obtenerPreguntasPorEtiquetas(etiquetas: string[]): Promise<Pregunta[]> {
  try {
    const params = new URLSearchParams({
      etiquetas: etiquetas.join(","),
    });
    const rsp = await consumirApi<ApiResponse<Pregunta[]>>(`${API_URLS.etiquetaPreguntas}?${params.toString()}`);
    return rsp.data;
  } catch (error) {
    console.error("Error al obtener preguntas por etiquetas", error);
    throw error;
  }
}

async function evaluarRespuestasConOpenRouter(payload: {
  preguntas: PreguntaAEvaluar[];
}): Promise<EvaluacionOpenRouterResponse> {
  try {
    const rsp = await consumirApiConBody<ApiResponse<EvaluacionOpenRouterResponse>>(API_URLS.evaluarRespuestas, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return rsp.data;
  } catch (error) {
    console.error("Error al evaluar respuestas con OpenRouter", error);
    throw error;
  }
}

export {
  construirUrlAsset,
  evaluarRespuestasConOpenRouter,
  obtenerEtiquetas,
  obtenerEtiquetaConPregunta,
  obtenerPreguntas,
  obtenerPreguntasPorEtiquetas,
};
