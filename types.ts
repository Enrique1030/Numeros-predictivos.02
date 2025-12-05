export enum ModelType {
  LINEAR_REGRESSION = 'Regresión Lineal',
  POLYNOMIAL_REGRESSION = 'Regresión Polinómica',
  DECISION_TREES = 'Árboles de Decisión',
  NEURAL_NETWORKS = 'Redes Neuronales (ANN)',
  SVM = 'Máquinas de Soporte Vectorial (SVM)'
}

export enum MetricType {
  ACCURACY = 'Precisión (Accuracy)',
  MSE = 'Error Cuadrático Medio (MSE)',
  RMSE = 'Raíz ECM (RMSE)',
  MAE = 'Error Absoluto Medio (MAE)',
  R2 = 'R-Cuadrado (R²)',
  F1 = 'F1 Score',
  PRECISION = 'Precision',
  RECALL = 'Recall'
}

export interface AnalysisRequest {
  dataContext: string;
  models: ModelType[];
  metrics: MetricType[];
  goal: string;
}

export interface Prediction {
  label: string;
  value: number;
  confidence?: string;
  sum?: number;     // Suma total de los números
  evens?: number;   // Cantidad de números pares
  odds?: number;    // Cantidad de números impares
}

export interface ChartDataPoint {
  name: string;
  historical: number | null;
  prediction: number | null;
}

export interface MetricItem {
  label: string;
  value: string;
  type: 'success' | 'warning' | 'info' | 'error'; // For UI coloring
  description?: string;
}

export interface AnalysisResult {
  pythonCode: string;
  metrics: {
    description: string;
    items: MetricItem[]; // Dynamic list of metrics
  };
  predictions: Prediction[];
  chartData: ChartDataPoint[];
  recommendations: string[];
}