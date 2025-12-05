import React, { useState, useRef } from 'react';
import { Upload, FileText, Play, Code, LayoutDashboard, Loader2, Sparkles, FileSpreadsheet, Ruler } from 'lucide-react';
import ModelSelector from './components/ModelSelector';
import MetricSelector from './components/MetricSelector';
import AnalysisDashboard from './components/AnalysisDashboard';
import CodeViewer from './components/CodeViewer';
import { ModelType, MetricType, AnalysisResult } from './types';
import { generateAnalysis } from './services/geminiService';
import * as XLSX from 'xlsx';

enum Tab {
  DASHBOARD = 'DASHBOARD',
  CODE = 'CODE'
}

export default function App() {
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [goal, setGoal] = useState<string>('Analizar tendencias y predecir valores futuros.');
  const [selectedModels, setSelectedModels] = useState<ModelType[]>([ModelType.LINEAR_REGRESSION]);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>([MetricType.ACCURACY, MetricType.MSE]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null); // Reset previous results

    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Handle Excel files
        const data = await file.arrayBuffer();
        // Use type: 'array' for robust reading of array buffers
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        // Convert to CSV string to pass as context to the LLM
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        setFileContent(csv);
      } else {
        // Handle Text/CSV/JSON files
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setFileContent(text);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Error al leer el archivo. Asegúrate de que es un formato válido.");
    }
  };

  const handleRunAnalysis = async () => {
    if (!fileContent && goal.trim().length < 10) {
      alert("Por favor sube un archivo (Excel/CSV) o describe tu problema detalladamente.");
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const data = await generateAnalysis(
        fileContent || "No se proporcionó archivo, usa datos simulados basados en la descripción.",
        selectedModels,
        selectedMetrics,
        goal,
        fileName || "data.csv"
      );
      setResult(data);
      setActiveTab(Tab.DASHBOARD);
    } catch (error: any) {
      console.error(error);
      alert(`Hubo un error al generar el análisis: ${error.message || 'Verifica tu API Key o la consola para más detalles.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              DataMind AI Studio
            </h1>
          </div>
          <div className="text-sm text-slate-400">
            Powered by Gemini 3 Pro
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Panel: Configuration */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* File Upload Section */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-blue-400" />
                Fuente de Datos
              </h2>
              
              <div 
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-slate-700/30 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv,.txt,.json,.xlsx,.xls" 
                  className="hidden" 
                />
                {fileName.endsWith('xls') || fileName.endsWith('xlsx') ? (
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
                ) : (
                  <FileText className="w-10 h-10 mx-auto text-slate-500 mb-3" />
                )}
                
                {fileName ? (
                  <p className="text-blue-400 font-medium break-all">{fileName}</p>
                ) : (
                  <>
                    <p className="text-slate-300 font-medium">Click para subir Archivo</p>
                    <p className="text-xs text-slate-500 mt-1">Soporta Excel (.xlsx), CSV, JSON</p>
                  </>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-400 mb-2">Objetivo del Análisis</label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                  placeholder="Ej: Predecir los próximos números ganadores basándose en los sorteos históricos..."
                />
              </div>
            </div>

            {/* Model Selection */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <LayoutDashboard className="w-5 h-5 mr-2 text-purple-400" />
                Modelos y Algoritmos
              </h2>
              <ModelSelector selected={selectedModels} onChange={setSelectedModels} />
            </div>

            {/* Metric Selection */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Ruler className="w-5 h-5 mr-2 text-emerald-400" />
                Métricas de Evaluación
              </h2>
              <MetricSelector selected={selectedMetrics} onChange={setSelectedMetrics} />
            </div>

            {/* Action Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center shadow-lg transition-all ${
                isLoading 
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-900/20'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Analizando y Generando...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 mr-2 fill-current" />
                  Ejecutar Análisis
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Results */}
          <div className="xl:col-span-8">
            {!result ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-500 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg">Sube tu Excel/CSV y selecciona modelos para comenzar</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg w-fit border border-slate-700">
                  <button
                    onClick={() => setActiveTab(Tab.DASHBOARD)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === Tab.DASHBOARD 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard Interactivo
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab(Tab.CODE)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === Tab.CODE 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      Código Python Generado
                    </div>
                  </button>
                </div>

                {/* Content */}
                <div className="min-h-[600px]">
                  {activeTab === Tab.DASHBOARD ? (
                    <AnalysisDashboard result={result} />
                  ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                      <p className="text-slate-400 text-sm">
                        Este código ha sido generado automáticamente para tu archivo <strong>{fileName}</strong>. Utiliza <code>pandas</code> para procesar la estructura detectada y calcula las métricas solicitadas: {selectedMetrics.join(', ')}.
                      </p>
                      <CodeViewer code={result.pythonCode} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}