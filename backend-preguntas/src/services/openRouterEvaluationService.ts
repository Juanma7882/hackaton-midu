const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-8b-instruct:free";

export interface PreguntaAEvaluar {
    preguntaId: number;
    pregunta: string;
    respuestaCorrecta: string;
    respuestaUsuario: string;
    etiquetas?: string[];
}

export interface OpenRouterUsage {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
}

export interface Evaluacion {
    preguntaId: number;
    puntuacion: number;
    esCorrecta: boolean;
    feedback: string;
    mejoras: string[];
}

export interface OpenRouterMessage {
    role: "system" | "user" | "assistant";
    content: string;
    reasoning_details?: unknown;
}

interface OpenRouterResponse {
    choices?: Array<{
        message?: {
            content?: string;
            reasoning_details?: unknown;
        };
    }>;
    usage?: OpenRouterUsage;
}

interface StreamChatPayload {
    messages: OpenRouterMessage[];
    model?: string;
    temperature?: number;
}

class OpenRouterEvaluationService {
    private obtenerHeaders() {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error("Falta definir OPENROUTER_API_KEY");
        }

        return {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3003",
            "X-Title": process.env.OPENROUTER_APP_NAME || "hackaton-midu",
        };
    }

    private construirPrompt(pregunta: PreguntaAEvaluar) {
        return [
            "Evalua UNA respuesta de una entrevista tecnica.",
            "",
            "PREGUNTA:",
            pregunta.pregunta,
            "",
            "RESPUESTA CORRECTA (referencia):",
            pregunta.respuestaCorrecta,
            "",
            "RESPUESTA DEL USUARIO:",
            pregunta.respuestaUsuario,
            "",
            "Devuelve solo JSON valido con esta forma:",
            '{"preguntaId":1,"puntuacion":0,"esCorrecta":false,"feedback":"texto breve","mejoras":["sugerencia1","sugerencia2"]}',
            "",
            "Reglas:",
            "- puntuacion: 0 a 100.",
            "- esCorrecta: true solo si la respuesta del usuario es correcta en lo esencial.",
            "- feedback: breve, claro, en espanol.",
            "- mejoras: entre 0 y 3 sugerencias concretas.",
        ].join("\n");
    }

    async crearStreamChat(payload: StreamChatPayload) {
        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: this.obtenerHeaders(),
            body: JSON.stringify({
                model: payload.model || DEFAULT_OPENROUTER_MODEL,
                temperature: payload.temperature ?? 0.2,
                stream: true,
                messages: payload.messages,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter respondio con ${response.status}: ${errorText}`);
        }

        if (!response.body) {
            throw new Error("OpenRouter no devolvio un stream");
        }

        return {
            model: payload.model || DEFAULT_OPENROUTER_MODEL,
            stream: response.body,
        };
    }

    async evaluarPregunta(pregunta: PreguntaAEvaluar): Promise<{
        modelo: string;
        evaluacion: Evaluacion;
        uso?: OpenRouterUsage;
        contenidoCrudo: string;
    }> {
        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: this.obtenerHeaders(),
            body: JSON.stringify({
                model: DEFAULT_OPENROUTER_MODEL,
                temperature: 0.2,
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "user",
                        content: this.construirPrompt(pregunta),
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter respondio con ${response.status}: ${errorText}`);
        }

        const data = await response.json() as OpenRouterResponse;
        const contenidoCrudo = data.choices?.[0]?.message?.content ?? "";

        if (!contenidoCrudo) {
            throw new Error("OpenRouter no devolvio contenido evaluable");
        }

        const contenidoNormalizado = contenidoCrudo.trim();
        const resultado = JSON.parse(contenidoNormalizado) as Evaluacion;

        const evaluacion: Evaluacion = {
            preguntaId: pregunta.preguntaId,
            puntuacion: typeof resultado.puntuacion === "number" ? resultado.puntuacion : 0,
            esCorrecta: Boolean(resultado.esCorrecta),
            feedback: String(resultado.feedback ?? ""),
            mejoras: Array.isArray(resultado.mejoras) ? resultado.mejoras : [],
        };

        return {
            modelo: DEFAULT_OPENROUTER_MODEL,
            evaluacion,
            uso: data.usage,
            contenidoCrudo: contenidoNormalizado,
        };
    }

    async evaluarPreguntas(preguntas: PreguntaAEvaluar[]): Promise<{
        modelo: string;
        evaluaciones: Evaluacion[];
        uso?: OpenRouterUsage;
    }> {
        const resultados: Evaluacion[] = [];
        let usoTotal: OpenRouterUsage | undefined;

        for (const pregunta of preguntas) {
            const { evaluacion, uso } = await this.evaluarPregunta(pregunta);
            resultados.push(evaluacion);

            if (uso) {
                usoTotal = {
                    prompt_tokens: (usoTotal?.prompt_tokens ?? 0) + (uso.prompt_tokens ?? 0),
                    completion_tokens: (usoTotal?.completion_tokens ?? 0) + (uso.completion_tokens ?? 0),
                    total_tokens: (usoTotal?.total_tokens ?? 0) + (uso.total_tokens ?? 0),
                };
            }
        }

        return {
            modelo: DEFAULT_OPENROUTER_MODEL,
            evaluaciones: resultados,
            uso: usoTotal,
        };
    }
}

export default new OpenRouterEvaluationService();
