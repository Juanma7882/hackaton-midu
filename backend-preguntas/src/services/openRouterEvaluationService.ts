const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-8b-instruct:free";

export interface PreguntaAEvaluar {
    preguntaId: number;
    pregunta: string;
    respuestaCorrecta: string;
    respuestaUsuario: string;
    etiquetas?: string[];
}

interface OpenRouterResponse {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
    usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
    };
}

class OpenRouterEvaluationService {
    private construirPrompt(preguntas: PreguntaAEvaluar[]) {
        return [
            "Evalua respuestas de una entrevista tecnica.",
            "Devuelve solo JSON valido con esta forma:",
            '{"evaluaciones":[{"preguntaId":1,"puntuacion":0,"esCorrecta":false,"feedback":"texto","mejoras":["texto"]}]}',
            "La puntuacion debe ir de 0 a 100.",
            "esCorrecta debe ser true solo si la respuesta del usuario es correcta en lo esencial.",
            "feedback debe ser breve, claro y en espanol.",
            "mejoras debe incluir entre 0 y 3 sugerencias concretas.",
            "Preguntas a evaluar:",
            JSON.stringify(preguntas),
        ].join("\n");
    }

    async evaluarPreguntas(preguntas: PreguntaAEvaluar[]) {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error("Falta definir OPENROUTER_API_KEY");
        }

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
                "X-Title": process.env.OPENROUTER_APP_NAME || "hackaton-midu",
            },
            body: JSON.stringify({
                model: DEFAULT_OPENROUTER_MODEL,
                temperature: 0.2,
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: "Eres un evaluador tecnico preciso. Responde exclusivamente con JSON valido.",
                    },
                    {
                        role: "user",
                        content: this.construirPrompt(preguntas),
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
        const resultado = JSON.parse(contenidoNormalizado) as { evaluaciones?: unknown[] };

        return {
            modelo: DEFAULT_OPENROUTER_MODEL,
            evaluaciones: Array.isArray(resultado.evaluaciones) ? resultado.evaluaciones : [],
            uso: data.usage,
            contenidoCrudo: contenidoNormalizado,
        };
    }
}

export default new OpenRouterEvaluationService();
