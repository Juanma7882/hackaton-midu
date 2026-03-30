import { pipeline } from "@xenova/transformers";

const LOCAL_MODEL_LABEL = "local-transformers-js";
const LOCAL_EMBEDDING_MODEL = process.env.LOCAL_EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2";
const STOPWORDS = new Set([
    "a", "al", "algo", "algun", "alguna", "algunas", "algunos", "ante", "antes", "como", "con", "contra",
    "cual", "cuales", "cuando", "de", "del", "desde", "donde", "el", "ella", "ellas", "ellos", "en",
    "entre", "era", "eramos", "eran", "eres", "es", "esa", "esas", "ese", "eso", "esos", "esta",
    "estaba", "estado", "estan", "estar", "este", "esto", "estos", "fue", "fueron", "ha", "han", "hasta",
    "hay", "la", "las", "le", "les", "lo", "los", "mas", "me", "mi", "mis", "mucho", "muy", "no",
    "nos", "o", "para", "pero", "por", "porque", "que", "que", "se", "ser", "si", "sin", "sobre",
    "son", "su", "sus", "te", "tiene", "tienen", "tu", "un", "una", "uno", "unos", "y", "ya"
]);

export interface PreguntaAEvaluar {
    preguntaId: number;
    pregunta: string;
    respuestaCorrecta: string;
    respuestaUsuario: string;
    etiquetas?: string[];
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

class LocalEvaluationService {
    private extractorPromise?: Promise<any>;

    private async getExtractor() {
        if (!this.extractorPromise) {
            this.extractorPromise = pipeline("feature-extraction", LOCAL_EMBEDDING_MODEL);
        }

        return this.extractorPromise;
    }

    private normalizarTexto(texto: string) {
        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    private tokenizar(texto: string) {
        return this.normalizarTexto(texto)
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((token) => token.length > 2 && !STOPWORDS.has(token));
    }

    private extraerKeywords(texto: string, limite = 6) {
        const frecuencias = new Map<string, number>();

        for (const token of this.tokenizar(texto)) {
            frecuencias.set(token, (frecuencias.get(token) ?? 0) + 1);
        }

        return [...frecuencias.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .slice(0, limite)
            .map(([token]) => token);
    }

    private calcularSolapamiento(respuestaCorrecta: string, respuestaUsuario: string) {
        const correctas = new Set(this.extraerKeywords(respuestaCorrecta, 10));
        const usuario = new Set(this.extraerKeywords(respuestaUsuario, 10));

        if (correctas.size === 0) {
            return { ratio: 0, faltantes: [] as string[] };
        }

        const compartidas = [...correctas].filter((token) => usuario.has(token));
        const faltantes = [...correctas].filter((token) => !usuario.has(token));

        return {
            ratio: compartidas.length / correctas.size,
            faltantes,
        };
    }

    private async crearEmbedding(texto: string) {
        const extractor = await this.getExtractor();
        const output = await extractor(texto.trim() || "vacio", {
            pooling: "mean",
            normalize: true,
        });

        return Array.from(output.data as Float32Array);
    }

    private productoPunto(a: number[], b: number[]) {
        const length = Math.min(a.length, b.length);
        let total = 0;

        for (let i = 0; i < length; i++) {
            total += a[i] * b[i];
        }

        return total;
    }

    private clamp(valor: number, minimo: number, maximo: number) {
        return Math.max(minimo, Math.min(maximo, valor));
    }

    private construirFeedback(score: number, overlap: number, faltantes: string[], esCorrecta: boolean) {
        if (esCorrecta && score < 85) {
            return faltantes.length > 0
                ? `Respuesta correcta en lo esencial, aunque puedes hacerla mas completa incluyendo ${faltantes.slice(0, 3).join(", ")}.`
                : "Respuesta correcta en lo esencial, con margen para aportar mas precision tecnica.";
        }

        if (score >= 85) {
            return overlap >= 0.6
                ? "Respuesta solida y alineada con los conceptos clave esperados."
                : "Respuesta correcta en lo esencial, aunque puede ser mas precisa en algunos terminos tecnicos.";
        }

        if (score >= 65) {
            return faltantes.length > 0
                ? `Respuesta parcialmente correcta, pero faltan conceptos importantes como ${faltantes.slice(0, 3).join(", ")}.`
                : "Respuesta parcialmente correcta, pero le falta profundidad tecnica.";
        }

        return faltantes.length > 0
            ? `La respuesta no cubre bien la idea central. Conviene reforzar conceptos como ${faltantes.slice(0, 3).join(", ")}.`
            : "La respuesta es insuficiente o demasiado vaga para considerarla correcta.";
    }

    private construirMejoras(respuestaUsuario: string, faltantes: string[], score: number) {
        const mejoras: string[] = [];

        if (respuestaUsuario.trim().length < 30) {
            mejoras.push("Agrega mas contexto tecnico y explica mejor el por que de la respuesta.");
        }

        if (faltantes.length > 0) {
            mejoras.push(`Incluye conceptos clave como ${faltantes.slice(0, 3).join(", ")}.`);
        }

        if (score < 70) {
            mejoras.push("Usa un ejemplo corto para demostrar que entiendes cuando y como se aplica el concepto.");
        }

        return mejoras.slice(0, 3);
    }

    private construirResumenTexto(puntuacionGeneral: number, correctas: number, total: number) {
        if (puntuacionGeneral >= 85) {
            return `Buen desempeno general: resolviste ${correctas} de ${total} preguntas con respuestas tecnicamente consistentes.`;
        }

        if (puntuacionGeneral >= 65) {
            return `Desempeno intermedio: hay buena base, pero todavia faltan detalles tecnicos para consolidar varias respuestas.`;
        }

        return `Desempeno inicial: conviene repasar varios fundamentos antes de volver a intentar el quiz.`;
    }

    private construirFortalezas(evaluaciones: Evaluacion[]) {
        return evaluaciones
            .filter((evaluacion) => evaluacion.esCorrecta)
            .slice(0, 4)
            .map((evaluacion) => `Buen manejo de: ${evaluacion.pregunta ?? `pregunta ${evaluacion.preguntaId}`}.`);
    }

    private construirPendientes(evaluaciones: Evaluacion[]) {
        return evaluaciones
            .filter((evaluacion) => !evaluacion.esCorrecta)
            .slice(0, 4)
            .map((evaluacion) => `Reforzar: ${evaluacion.pregunta ?? `pregunta ${evaluacion.preguntaId}`}.`);
    }

    private construirConsejos(evaluaciones: Evaluacion[]) {
        const consejos: string[] = [];
        const bajas = evaluaciones.filter((evaluacion) => evaluacion.puntuacion < 70).length;

        if (bajas > 0) {
            consejos.push("Practica respuestas en formato definicion + cuando usarlo + ejemplo breve.");
        }

        if (evaluaciones.some((evaluacion) => evaluacion.mejoras.some((mejora) => mejora.includes("conceptos clave")))) {
            consejos.push("Antes de responder, menciona explicitamente los conceptos tecnicos mas importantes.");
        }

        consejos.push("Evita respuestas demasiado cortas cuando la pregunta requiere matices o comparaciones.");

        return consejos.slice(0, 4);
    }

    private construirRespuestaChat(messages: Array<{ role: string; content: string }>) {
        const ultimoMensaje = [...messages].reverse().find((message) => message.role === "user")?.content?.trim();

        if (!ultimoMensaje) {
            return "No recibi un mensaje para procesar localmente.";
        }

        return [
            "Estoy funcionando con inferencia local en Transformers.js.",
            "Puedo ayudarte a evaluar respuestas tecnicas y resumir quizzes sin depender de servicios externos.",
            `Mensaje recibido: ${ultimoMensaje}`,
        ].join(" ");
    }

    async crearStreamChat({
        messages,
        model,
    }: {
        messages: Array<{ role: string; content: string }>;
        model?: string;
        temperature?: number;
    }): Promise<{
        stream: ReadableStream<Uint8Array>;
        model: string;
    }> {
        const encoder = new TextEncoder();
        const modeloUsado = model || LOCAL_MODEL_LABEL;
        const respuesta = this.construirRespuestaChat(messages);
        const chunks = respuesta.match(/.{1,80}/g) ?? [respuesta];

        const stream = new ReadableStream<Uint8Array>({
            start(controller) {
                for (const chunk of chunks) {
                    controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify({ content: chunk })}\n\n`));
                }

                controller.enqueue(encoder.encode("event: done\ndata: [DONE]\n\n"));
                controller.close();
            },
        });

        return {
            stream,
            model: modeloUsado,
        };
    }

    async evaluarPregunta(pregunta: PreguntaAEvaluar): Promise<{
        modelo: string;
        evaluacion: Evaluacion;
        contenidoCrudo: string;
    }> {
        const respuestaUsuario = String(pregunta.respuestaUsuario ?? "").trim();

        if (!respuestaUsuario) {
            const evaluacion = {
                preguntaId: pregunta.preguntaId,
                puntuacion: 0,
                esCorrecta: false,
                feedback: "No se envio una respuesta para evaluar.",
                mejoras: ["Escribe una respuesta aunque sea breve para poder compararla con la referencia."],
                pregunta: pregunta.pregunta,
            };

            return {
                modelo: LOCAL_MODEL_LABEL,
                evaluacion,
                contenidoCrudo: JSON.stringify(evaluacion),
            };
        }

        const [embeddingCorrecta, embeddingUsuario] = await Promise.all([
            this.crearEmbedding(pregunta.respuestaCorrecta),
            this.crearEmbedding(respuestaUsuario),
        ]);

        const similitudSemantica = this.clamp(this.productoPunto(embeddingCorrecta, embeddingUsuario), 0, 1);
        const { ratio: overlap, faltantes } = this.calcularSolapamiento(pregunta.respuestaCorrecta, respuestaUsuario);
        const ratioLongitud = this.clamp(
            respuestaUsuario.length / Math.max(pregunta.respuestaCorrecta.trim().length, 1),
            0,
            1.2,
        );
        const scoreBase = (similitudSemantica * 0.8) + (overlap * 0.15) + (Math.min(ratioLongitud, 1) * 0.05);
        const puntuacion = Math.round(this.clamp(scoreBase * 100, 0, 100));
        const esCorrecta = puntuacion >= 65 || similitudSemantica >= 0.62 || (similitudSemantica >= 0.55 && overlap >= 0.2);
        const evaluacion: Evaluacion = {
            preguntaId: pregunta.preguntaId,
            puntuacion,
            esCorrecta,
            feedback: this.construirFeedback(puntuacion, overlap, faltantes, esCorrecta),
            mejoras: this.construirMejoras(respuestaUsuario, faltantes, puntuacion),
            pregunta: pregunta.pregunta,
        };

        return {
            modelo: LOCAL_MODEL_LABEL,
            evaluacion,
            contenidoCrudo: JSON.stringify({
                similitudSemantica,
                overlap,
                faltantes,
                evaluacion,
            }),
        };
    }

    async evaluarPreguntas(preguntas: PreguntaAEvaluar[]): Promise<{
        modelo: string;
        evaluaciones: Evaluacion[];
    }> {
        const evaluaciones: Evaluacion[] = [];

        for (const pregunta of preguntas) {
            const { evaluacion } = await this.evaluarPregunta(pregunta);
            evaluaciones.push(evaluacion);
        }

        return {
            modelo: LOCAL_MODEL_LABEL,
            evaluaciones,
        };
    }

    async generarResumenQuiz(preguntas: PreguntaAEvaluar[], evaluaciones: Evaluacion[] = []): Promise<QuizOverview> {
        const evaluacionesFinales = evaluaciones.length === preguntas.length
            ? evaluaciones
            : (await this.evaluarPreguntas(preguntas)).evaluaciones;
        const puntuacionGeneral = evaluacionesFinales.length > 0
            ? Math.round(evaluacionesFinales.reduce((acc, item) => acc + item.puntuacion, 0) / evaluacionesFinales.length)
            : 0;
        const correctas = evaluacionesFinales.filter((evaluacion) => evaluacion.esCorrecta).length;
        const fortalezas = this.construirFortalezas(evaluacionesFinales);
        const cosasParaMejorar = this.construirPendientes(evaluacionesFinales);
        const temasARepasar = cosasParaMejorar.length > 0
            ? cosasParaMejorar
            : ["Mantener practica de conceptos y explicaciones tecnicas."];

        return {
            puntuacionGeneral,
            resumen: this.construirResumenTexto(puntuacionGeneral, correctas, evaluacionesFinales.length),
            fortalezas: fortalezas.length > 0 ? fortalezas : ["Hay una base tecnica util para seguir profundizando."],
            cosasParaMejorar: cosasParaMejorar.length > 0 ? cosasParaMejorar : ["Puedes ganar precision agregando mas detalle tecnico en cada respuesta."],
            temasARepasar,
            consejosGenerales: this.construirConsejos(evaluacionesFinales),
            evaluaciones: evaluacionesFinales,
            modelo: LOCAL_MODEL_LABEL,
            procesadoLocal: true,
        };
    }
}

export default new LocalEvaluationService();
