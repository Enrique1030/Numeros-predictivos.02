import React from 'react';
import { MetricType } from '../types';
import { Ruler, Activity, Target, Percent, BarChart3, Hash } from 'lucide-react';

interface Props {
  selected: MetricType[];
  onChange: (metrics: MetricType[]) => void;
}

const MetricSelector: React.FC<Props> = ({ selected, onChange }) => {
  const toggleMetric = (metric: MetricType) => {
    if (selected.includes(metric)) {
      onChange(selected.filter((m) => m !== metric));
    } else {
      onChange([...selected, metric]);
    }
  };

  const metrics = [
    { type: MetricType.ACCURACY, icon: <Target className="w-4 h-4" />, label: 'Accuracy' },
    { type: MetricType.MSE, icon: <Activity className="w-4 h-4" />, label: 'MSE' },
    { type: MetricType.RMSE, icon: <Activity className="w-4 h-4" />, label: 'RMSE' },
    { type: MetricType.MAE, icon: <Ruler className="w-4 h-4" />, label: 'MAE' },
    { type: MetricType.R2, icon: <Percent className="w-4 h-4" />, label: 'R² Score' },
    { type: MetricType.F1, icon: <BarChart3 className="w-4 h-4" />, label: 'F1 Score' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map((item) => {
        const isSelected = selected.includes(item.type);
        return (
          <button
            key={item.type}
            onClick={() => toggleMetric(item.type)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md border text-sm transition-all duration-200 ${
              isSelected
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className={isSelected ? 'text-emerald-400' : 'text-slate-500'}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MetricSelector;