import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle, BarChart3, HelpCircle, Layers } from 'lucide-react';
import { api } from '../services/api';

export const ModelEvaluation = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('Gradient Boosting');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.getModelMetrics();
        setMetrics(data);
        if (data.best_model) setSelectedModel(data.best_model);
      } catch (err) {
        console.error('Failed to load model metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const classes = metrics?.classes || ['Legitimate', 'Suspicious', 'Phishing', 'Malicious'];
  const comparison = metrics?.models_comparison || {};
  const featureImportances = metrics?.feature_importances || {};
  const currentModelData = comparison[selectedModel] || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#0c1424] border border-cyan-500/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Machine Learning Model Evaluation & Benchmarks
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Trained on engineered 24-dimensional feature vectors. Multi-class prediction across 4 target categories: Legitimate, Suspicious, Phishing, and Malicious.
          </p>
        </div>
        <div className="bg-cyan-950/50 border border-cyan-500/40 px-3.5 py-2 rounded-xl text-right">
          <span className="text-[10px] text-cyan-400 uppercase font-mono block">Selected Production Model</span>
          <strong className="text-sm font-bold text-white">{metrics?.best_model || 'Gradient Boosting'}</strong>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
        <h3 className="text-sm font-bold text-white mb-3">Candidate Algorithm Benchmarks Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080d18] text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision (Weighted)</th>
                <th className="py-2.5 px-3">Recall (Weighted)</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">ROC-AUC (OvR)</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {Object.entries(comparison).map(([name, data]) => {
                const isBest = name === metrics?.best_model;
                return (
                  <tr 
                    key={name}
                    onClick={() => setSelectedModel(name)}
                    className={`cursor-pointer transition-colors ${
                      selectedModel === name ? 'bg-cyan-950/30 text-cyan-300' : 'hover:bg-slate-800/20 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold font-sans flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isBest ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      {name}
                    </td>
                    <td className="py-3 px-3">{(data.accuracy * 100).toFixed(2)}%</td>
                    <td className="py-3 px-3">{(data.precision * 100).toFixed(2)}%</td>
                    <td className="py-3 px-3">{(data.recall * 100).toFixed(2)}%</td>
                    <td className="py-3 px-3 font-bold text-white">{(data.f1_score * 100).toFixed(2)}%</td>
                    <td className="py-3 px-3 text-cyan-400">{data.roc_auc.toFixed(4)}</td>
                    <td className="py-3 px-3 text-right font-sans">
                      {isBest ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          Active In Production
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Evaluated Candidate</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Confusion Matrix & Feature Importances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix */}
        <div className="lg:col-span-6 rounded-xl bg-[#0c1424] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Confusion Matrix</h3>
              <p className="text-xs text-slate-400">Model: {selectedModel}</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
              4x4 Multi-Class Matrix
            </span>
          </div>

          {currentModelData.confusion_matrix ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-slate-500 font-sans">Actual \ Predicted</th>
                    {classes.map(c => (
                      <th key={c} className="p-2 text-slate-300 font-medium truncate max-w-[80px]">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {currentModelData.confusion_matrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="p-2 text-left font-semibold text-slate-300 font-sans">{classes[rIdx]}</td>
                      {row.map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        return (
                          <td 
                            key={cIdx} 
                            className={`p-2.5 font-bold ${
                              isDiagonal 
                                ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/20' 
                                : val > 0 ? 'bg-red-950/20 text-red-400' : 'text-slate-600'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Diagonals indicate correct classifications</span>
                <span>Off-diagonals indicate false positives/negatives</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Matrix data unavailable.</p>
          )}
        </div>

        {/* Feature Importances */}
        <div className="lg:col-span-6 rounded-xl bg-[#0c1424] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Top Feature Importances</h3>
              <p className="text-xs text-slate-400">Relative Gini importance in tree splits</p>
            </div>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {Object.entries(featureImportances).slice(0, 10).map(([feature, imp]) => (
              <div key={feature} className="text-xs font-mono">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300">{feature}</span>
                  <span className="text-cyan-400 font-bold">{(imp * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#080d18] h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" 
                    style={{ width: `${imp * 100 * 3}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

