import React from 'react';
import { ModelType } from '../types';
import { BrainCircuit, Activity, Split, Network, TrendingUp } from 'lucide-react';

interface Props {
  selected: ModelType[];
  onChange: (models: ModelType[]) => void;
}

const ModelSelector: React.FC<Props> = ({ selected, onChange }) => {
  const toggleModel = (model: ModelType) => {
    if (selected.includes(model)) {
      onChange(selected.filter((m) => m !== model));
    } else {
      onChange([...selected, model]);
    }
  };

  const models = [
    { type: ModelType.LINEAR_REGRESSION, icon: <TrendingUp className="w-5 h-5" />, label: 'Regresión Lineal' },
    { type: ModelType.POLYNOMIAL_REGRESSION, icon: <Activity className="w-5 h-5" />, label: 'Regresión Polinómica' },
    { type: ModelType.DECISION_TREES, icon: <Split className="w-5 h-5" />, label: 'Árboles de Decisión' },
    { type: ModelType.NEURAL_NETWORKS, icon: <BrainCircuit className="w-5 h-5" />, label: 'Redes Neuronales' },
    { type: ModelType.SVM, icon: <Network className="w-5 h-5" />, label: 'SVM' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {models.map((item) => {
        const isSelected = selected.includes(item.type);
        return (
          <button
            key={item.type}
            onClick={() => toggleModel(item.type)}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
              isSelected
                ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className={isSelected ? 'text-blue-400' : 'text-slate-500'}>
              {item.icon}
            </div>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModelSelector;
