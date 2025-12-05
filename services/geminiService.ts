import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ModelType, MetricType, AnalysisResult } from "../types";

// Using Gemini 3 Pro for complex coding and reasoning tasks
const MODEL_NAME = "gemini-3-pro-preview";

export const generateAnalysis = async (
  dataSnippet: string,
  selectedModels: ModelType[],
  selectedMetrics: MetricType[],
  userGoal: string,
  fileName: string = "data.csv"
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelsList = selectedModels.join(", ");
  const metricsList = selectedMetrics.join(", ");
  
  const systemInstruction = `
    Actúa como un experto Ingeniero de Datos y Científico de Datos Senior especializado en análisis predictivo y series temporales.
    Tu objetivo es:
    1. Generar código Python robusto y profesional para leer el archivo '${fileName}' y analizarlo.
       - Si el archivo es Excel (.xlsx/.xls), USA 'pd.read_excel("${fileName}")'.
       - Si es CSV, usa 'pd.read_csv'.
    
    INSTRUCCIONES CRÍTICAS PARA DATOS DE SORTEOS (Columnas tipo N1, N2... N6):
    - Si detectas columnas que sugieren un sorteo (N1 a N6, Bolas, Números, etc.):
      - Tu prioridad absoluta es PREDECIR LA PRÓXIMA COMBINACIÓN DE 6 NÚMEROS.
      - Debes generar EXACTAMENTE 5 COMBINACIONES DISTINTAS probables.
      - El código Python generado DEBE incluir una función o lógica explícita para calcular y mostrar estas estadísticas para cada combinación predicha:
        * Suma total de los 6 números.
        * Cantidad de números Pares.
        * Cantidad de números Impares.
      - El algoritmo en Python debe usar MultiOutputRegressor (ej: RandomForest o LSTM) o análisis de frecuencia para predecir vectores completos.
      
    MÉTRICAS DE EVALUACIÓN:
    - Debes calcular y mostrar explícitamente las siguientes métricas seleccionadas por el usuario: ${metricsList}.
    - Asegúrate de incluir el código Python para calcular estas métricas (usando sklearn.metrics u otras librerías).

    El código Python debe incluir:
    - Carga de datos correcta.
    - Limpieza de datos.
    - Entrenamiento de modelos (${modelsList}).
    - Cálculo de métricas: ${metricsList}.
    - Prints claros de las 5 predicciones con el formato "N1 - N2 - N3..." y sus stats (Suma, Pares, Impares).
  `;

  // Provide a larger context window since Gemini 3 Pro can handle it
  // Truncate to 100,000 chars to ensure we fit within reasonable limits but give plenty of data for charts
  const truncatedData = dataSnippet.length > 100000 ? dataSnippet.substring(0, 100000) + "...(truncado)" : dataSnippet;

  const prompt = `
    Nombre del archivo: ${fileName}
    
    Snippet de los datos:
    ${truncatedData}

    Objetivo del usuario: ${userGoal}

    Modelos solicitados: ${modelsList}
    Métricas solicitadas: ${metricsList}

    Genera una respuesta JSON con la siguiente estructura estricta:
    1. "pythonCode": El script completo en Python.
       - Si es sorteo, el script debe imprimir las 5 combinaciones más probables Y sus estadísticas (Suma, Pares, Impares).
    2. "metrics": Un objeto que contiene:
       - "description": Resumen textual del rendimiento.
       - "items": Array de objetos con "label" (Nombre de la métrica), "value" (Valor numérico o string formateado), y "type" ('success' | 'warning' | 'info' | 'error').
    3. "predictions": Array de EXACTAMENTE 5 objetos.
       - PARA SORTEOS/LOTERÍA (N1...N6): 
         - 'label': LA SECUENCIA DE NÚMEROS SEPARADA POR GUIONES (String: "N1 - N2 - N3 - N4 - N5 - N6"). Asegúrate de usar guiones.
         - 'value': Probabilidad estimada (0-100).
         - 'sum': La suma matemática de los 6 números (Number).
         - 'evens': Cantidad de números pares (Number).
         - 'odds': Cantidad de números impares (Number).
       - OTROS CASOS: 'label' es la variable, 'value' el valor.
    4. "chartData": Array para visualizar. 
       - IMPORTANTE: Genera AL MENOS 50-100 puntos de datos históricos reales (extraídos del snippet) para que el gráfico sea denso y útil.
       - Sorteos: Grafica la suma de los números de cada sorteo histórico (eje Y) vs el índice/fecha (eje X) para ver la volatilidad.
    5. "recommendations": Lista de 3 recomendaciones basadas en los datos.
  `;

  // Define the schema using the Type enum correctly
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      pythonCode: { type: Type.STRING, description: "El código Python completo para análisis y predicción." },
      metrics: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Resumen del estado del modelo." },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "Nombre de la métrica (ej: RMSE)." },
                value: { type: Type.STRING, description: "Valor de la métrica." },
                type: { type: Type.STRING, enum: ["success", "warning", "info", "error"] }
              },
              required: ["label", "value", "type"]
            }
          }
        },
        required: ["description", "items"]
      },
      predictions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, description: "La combinación de números (ej: '10 - 20 - 30 - 40 - 50 - 60')." },
            value: { type: Type.NUMBER, description: "Score de probabilidad (0-100)." },
            confidence: { type: Type.STRING, description: "Texto de confianza (ej: 'Alta')." },
            sum: { type: Type.NUMBER, description: "Suma total de los números." },
            evens: { type: Type.NUMBER, description: "Cantidad de pares." },
            odds: { type: Type.NUMBER, description: "Cantidad de impares." }
          },
          required: ["label", "value"]
        }
      },
      chartData: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            historical: { type: Type.NUMBER, nullable: true },
            prediction: { type: Type.NUMBER, nullable: true }
          },
          required: ["name"]
        }
      },
      recommendations: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["pythonCode", "metrics", "predictions", "chartData", "recommendations"]
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error generating analysis:", error);
    throw error;
  }
};