import React from 'react';
import { AnalysisResult } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { CheckCircle2, TrendingUp, AlertCircle, Calculator, Hash, Divide, Activity, Info } from 'lucide-react';

interface Props {
  result: AnalysisResult;
}

const AnalysisDashboard: React.FC<Props> = ({ result }) => {
  
  // Helper to render lottery balls if the label looks like a sequence of numbers
  const renderPredictionLabel = (label: string) => {
    // Split by hyphen, comma or space, filter out empty strings
    const parts = label.split(/[\s-,\.]+/).filter(p => p.trim() !== '' && !isNaN(Number(p)));
    
    // If we have 3 or more numbers, treat it as a lottery sequence
    if (parts.length >= 3) {
      return (
        <div className="flex flex-wrap gap-2 my-2">
          {parts.map((num, i) => (
            <div 
              key={i} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/50 font-bold text-white shadow-lg text-sm transform hover:scale-110 transition-transform cursor-default"
            >
              {num}
            </div>
          ))}
        </div>
      );
    }
    
    return <span className="text-slate-200 font-mono text-lg tracking-wide">{label}</span>;
  };

  const getMetricIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('accuracy') || l.includes('precis')) return <CheckCircle2 className="w-5 h-5" />;
    if (l.includes('mse') || l.includes('rmse') || l.includes('mae')) return <Activity className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {result.metrics.items.map((metric, idx) => (
          <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
            <div className={`flex items-center space-x-2 mb-2 ${getMetricColor(metric.type)}`}>
              {getMetricIcon(metric.label)}
              <h3 className="font-semibold text-sm uppercase tracking-wide">{metric.label}</h3>
            </div>
            <p className="text-2xl font-bold text-white truncate" title={metric.value}>
              {metric.value}
            </p>
          </div>
        ))}
        
        {/* Description Card */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 md:col-span-2 lg:col-span-1">
           <div className="flex items-center space-x-2 text-slate-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Estado</h3>
          </div>
          <p className="text-sm text-slate-300 leading-snug line-clamp-3" title={result.metrics.description}>
            {result.metrics.description}
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-6">Proyección Histórica y Tendencias</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey="historical" 
                name="Datos Históricos" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={result.chartData.length > 50 ? false : { r: 3 }} 
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="prediction" 
                name="Tendencia IA" 
                stroke="#10b981" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={{ r: 4 }} 
              />
              <Brush 
                dataKey="name" 
                height={30} 
                stroke="#475569" 
                fill="#1e293b"
                tickFormatter={() => ''}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center italic">
          Usa el deslizador inferior en el gráfico para hacer zoom en períodos específicos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Predictions */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Hash className="w-24 h-24 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center relative z-10">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
            Top 5 Combinaciones Probables
          </h3>
          <div className="space-y-4 relative z-10">
            {result.predictions.map((pred, idx) => (
              <div key={idx} className="flex flex-col p-4 bg-slate-750 rounded-xl border border-slate-600/50 hover:border-blue-500/50 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 block">
                      Opción #{idx + 1}
                    </span>
                    {renderPredictionLabel(pred.label)}
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center justify-end space-x-1">
                      <span className="text-2xl font-bold text-emerald-400">{pred.value}</span>
                      <span className="text-sm text-emerald-600">%</span>
                    </div>
                    {pred.confidence && <span className="text-xs text-slate-500">{pred.confidence}</span>}
                  </div>
                </div>
                
                {/* Stats Row for Lottery Data */}
                {(pred.sum !== undefined || pred.evens !== undefined) && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-3 border-t border-slate-700/50">
                    {pred.sum !== undefined && (
                      <div className="flex items-center px-2 py-1 rounded-md bg-slate-900/50 border border-slate-700 text-xs text-slate-300" title="Suma Total">
                        <Calculator className="w-3 h-3 mr-1.5 text-blue-400" />
                        Suma: <span className="ml-1 font-semibold text-white">{pred.sum}</span>
                      </div>
                    )}
                    {pred.evens !== undefined && (
                      <div className="flex items-center px-2 py-1 rounded-md bg-slate-900/50 border border-slate-700 text-xs text-slate-300" title="Números Pares">
                        <Divide className="w-3 h-3 mr-1.5 text-purple-400" />
                        Pares: <span className="ml-1 font-semibold text-white">{pred.evens}</span>
                      </div>
                    )}
                    {pred.odds !== undefined && (
                      <div className="flex items-center px-2 py-1 rounded-md bg-slate-900/50 border border-slate-700 text-xs text-slate-300" title="Números Impares">
                        <Hash className="w-3 h-3 mr-1.5 text-amber-400" />
                        Impares: <span className="ml-1 font-semibold text-white">{pred.odds}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recomendaciones Estratégicas</h3>
          <ul className="space-y-4">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-slate-300">
                <div className="min-w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm mt-0.5 font-bold border border-blue-600/30">
                  {idx + 1}
                </div>
                <p className="text-sm leading-relaxed">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;