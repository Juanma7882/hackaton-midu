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

export interface Evaluacion {
    preguntaId: number;
    puntuacion: number;
    esCorrecta: boolean;
    feedback: string;
    mejoras: string[];
}

class OpenRouterEvaluationService {
    private construirPayload(pregunta: PreguntaAEvaluar, forzarJsonMode: boolean) {
        return {
            model: DEFAULT_OPENROUTER_MODEL,
            temperature: 0.2,
            ...(forzarJsonMode ? { response_format: { type: "json_object" } } : {}),
            messages: [
                {
                    role: "user",
                    content: [
                        "Eres un evaluador tecnico preciso.",
                        "Responde exclusivamente con JSON valido.",
                        "No incluyas markdown, explicaciones ni texto extra.",
                        "",
                        this.construirPrompt(pregunta),
                    ].join("\n"),
                },
            ],
        };
    }

    private async requestOpenRouter(apiKey: string, pregunta: PreguntaAEvaluar, forzarJsonMode: boolean) {
        return fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
                "X-Title": process.env.OPENROUTER_APP_NAME || "hackaton-midu",
            },
            body: JSON.stringify(this.construirPayload(pregunta, forzarJsonMode)),
        });
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

    async crearStreamChat({
        messages,
        model,
        temperature,
    }: {
        messages: Array<{ role: string; content: string }>;
        model?: string;
        temperature?: number;
    }): Promise<{
        stream: ReadableStream<Uint8Array>;
        model: string;
    }> {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error("Falta definir OPENROUTER_API_KEY");
        }

        const modeloUsado = model || DEFAULT_OPENROUTER_MODEL;
        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
                "X-Title": process.env.OPENROUTER_APP_NAME || "hackaton-midu",
            },
            body: JSON.stringify({
                model: modeloUsado,
                temperature: typeof temperature === "number" ? temperature : 0.7,
                stream: true,
                messages,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter respondio con ${response.status}: ${errorText}`);
        }

        if (!response.body) {
            throw new Error("OpenRouter no devolvio un stream valido");
        }

        return {
            stream: response.body,
            model: modeloUsado,
        };
    }

    async evaluarPregunta(pregunta: PreguntaAEvaluar): Promise<{
        modelo: string;
        evaluacion: Evaluacion;
        uso?: OpenRouterResponse["usage"];
        contenidoCrudo: string;
    }> {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error("Falta definir OPENROUTER_API_KEY");
        }

        let response = await this.requestOpenRouter(apiKey, pregunta, true);
        if (!response.ok) {
            const errorText = await response.text();
            const noSoportaJsonMode = response.status === 400 && errorText.includes("JSON mode is not enabled");
            if (noSoportaJsonMode) {
                response = await this.requestOpenRouter(apiKey, pregunta, false);
            } else {
                throw new Error(`OpenRouter respondio con ${response.status}: ${errorText}`);
            }
        }

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

    /** Evalua varias preguntas llamando a la API una por una */
    async evaluarPreguntas(preguntas: PreguntaAEvaluar[]): Promise<{
        modelo: string;
        evaluaciones: Evaluacion[];
        uso?: OpenRouterResponse["usage"];
    }> {
        const resultados: Evaluacion[] = [];
        let usoTotal = undefined;

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
