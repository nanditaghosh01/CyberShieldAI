import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, BarChart3, HelpCircle, Layers, Info, Award, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const ModelEvaluation = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('Random Forest');

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

  const friendlyFeatureNames = {
    nb_dots: 'Subdomain & Dot Count',
    nb_hyphens: 'Hyphens in Domain (Typo spoofing)',
    url_entropy: 'Random Character Entropy',
    prefix_suffix: 'Prefix/Suffix Impersonation Flag',
    ratio_digits_url: 'Digit Ratio in URL',
    longest_word_path: 'Long Obfuscated Path Tokens',
    length_url: 'Overall URL Character Length',
    shortest_word_host: 'Abbreviated Host Tokens',
    char_repeat: 'Repeated Characters / Punycode',
    https_flag: 'Valid HTTPS Enforcement Flag'
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Card */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 sm:p-7 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#1d3557] border border-[#457b9d]/40 flex items-center justify-center text-[#a9d8de]">
              <Cpu className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-[#f3fbf0]">
              Detection Engine & Model Benchmarks
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#a9d8de]/85 max-w-2xl leading-relaxed">
            Evaluated on 101,218 real-world website URLs from <code className="text-[#a9d8de] bg-[#0b1523] px-1.5 py-0.5 rounded">url_features_extracted1.csv</code>. See how our machine learning models compare in stopping phishing without blocking legitimate websites.
          </p>
        </div>

        <div className="bg-[#182b45] border border-[#457b9d]/50 px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0">
          <Award className="w-6 h-6 text-[#a9d8de]" />
          <div>
            <span className="text-[10px] text-[#a9d8de]/80 uppercase tracking-wider block font-medium">Production Choice</span>
            <strong className="text-sm font-bold text-[#f3fbf0]">{metrics?.best_model || 'Random Forest'}</strong>
          </div>
        </div>
      </div>

      {/* Metrics Explainer Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#122035] border border-[#274366] space-y-1">
          <span className="text-xs font-semibold text-[#a9d8de]">Accuracy</span>
          <p className="text-[11px] text-[#f3fbf0]/80">
            Overall percentage of test websites correctly classified.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#122035] border border-[#274366] space-y-1">
          <span className="text-xs font-semibold text-[#a9d8de]">Precision</span>
          <p className="text-[11px] text-[#f3fbf0]/80">
            When flagged as malicious, how often was it genuinely a threat.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#122035] border border-[#274366] space-y-1">
          <span className="text-xs font-semibold text-[#a9d8de]">Recall</span>
          <p className="text-[11px] text-[#f3fbf0]/80">
            What percentage of total phishing attacks were successfully caught.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#122035] border border-[#274366] space-y-1">
          <span className="text-xs font-semibold text-[#a9d8de]">F1-Score</span>
          <p className="text-[11px] text-[#f3fbf0]/80">
            Harmonic balance preventing false alarms while catching stealthy attacks.
          </p>
        </div>
      </div>

      {/* Models Comparison Table */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#f3fbf0]">Algorithm Comparison & Selection</h3>
            <p className="text-xs text-[#a9d8de]/80">Click any algorithm to view its confusion matrix below.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1523] text-[#a9d8de] border-b border-[#274366]">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Algorithm</th>
                <th className="py-3 px-3.5 font-semibold">Accuracy</th>
                <th className="py-3 px-3.5 font-semibold">Precision</th>
                <th className="py-3 px-3.5 font-semibold">Recall</th>
                <th className="py-3 px-3.5 font-semibold">F1-Score</th>
                <th className="py-3 px-3.5 font-semibold">ROC-AUC</th>
                <th className="py-3 px-3.5 text-right font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#274366]/60">
              {Object.entries(comparison).map(([name, data]) => {
                const isBest = name === metrics?.best_model;
                const isSelected = selectedModel === name;
                return (
                  <tr 
                    key={name}
                    onClick={() => setSelectedModel(name)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#182b45] text-[#f3fbf0]' : 'hover:bg-[#182b45]/50 text-[#a9d8de]/90'
                    }`}
                  >
                    <td className="py-3.5 px-3.5 font-semibold flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#a9d8de]' : 'bg-[#457b9d]'}`} />
                      <span>{name}</span>
                    </td>
                    <td className="py-3.5 px-3.5 font-mono">{(data.accuracy * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-3.5 font-mono">{(data.precision * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-3.5 font-mono">{(data.recall * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-3.5 font-mono font-bold text-[#f3fbf0]">{(data.f1_score * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-3.5 font-mono text-[#a9d8de]">{data.roc_auc.toFixed(4)}</td>
                    <td className="py-3.5 px-3.5 text-right">
                      {isBest ? (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#1d3557] text-[#a9d8de] border border-[#457b9d]/50">
                          Active in Engine
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#457b9d]">Benchmarked</span>
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
        <div className="lg:col-span-6 rounded-2xl bg-[#122035] border border-[#274366] p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#f3fbf0]">Prediction Breakdown (Confusion Matrix)</h3>
              <p className="text-xs text-[#a9d8de]/80">Viewing results for: <strong className="text-[#f3fbf0]">{selectedModel}</strong></p>
            </div>
          </div>

          {currentModelData.confusion_matrix ? (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-[#a9d8de]/70 font-sans font-medium text-[11px]">Actual \ Predicted</th>
                    {classes.map(c => (
                      <th key={c} className="p-2 text-[#a9d8de] font-semibold truncate max-w-[80px]">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#274366]">
                  {currentModelData.confusion_matrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="p-2.5 text-left font-medium text-[#f3fbf0] font-sans">{classes[rIdx]}</td>
                      {row.map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        return (
                          <td 
                            key={cIdx} 
                            className={`p-2.5 font-bold rounded-lg transition-colors ${
                              isDiagonal 
                                ? 'bg-[#182b45] text-[#a9d8de] border border-[#457b9d]/40' 
                                : val > 0 ? 'bg-[#28070a] text-[#f86b76] border border-[#e83845]/30' : 'text-[#457b9d]/60'
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

              <div className="mt-4 p-3 rounded-xl bg-[#0b1523] border border-[#274366] flex items-center justify-between text-xs text-[#a9d8de]/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#182b45] border border-[#457b9d] inline-block" />
                  Blue: Correct predictions
                </span>
                <span className="flex items-center gap-1.5 text-[#f86b76]">
                  <span className="w-2.5 h-2.5 rounded bg-[#28070a] border border-[#e83845] inline-block" />
                  Red: Misclassifications
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#a9d8de]/60">Data unavailable.</p>
          )}
        </div>

        {/* Feature Importances */}
        <div className="lg:col-span-6 rounded-2xl bg-[#122035] border border-[#274366] p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#f3fbf0]">Key Signals Influencing Detection</h3>
              <p className="text-xs text-[#a9d8de]/80">Most influential URL characteristics identified by the model</p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#a9d8de]" />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 pt-1">
            {Object.entries(featureImportances).slice(0, 8).map(([feature, imp]) => {
              const friendlyName = friendlyFeatureNames[feature] || feature.replace(/_/g, ' ');
              return (
                <div key={feature} className="text-xs space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#f3fbf0] font-medium">{friendlyName}</span>
                    <span className="text-[#a9d8de] font-mono font-bold">{(imp * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#0b1523] h-2 rounded-full overflow-hidden border border-[#274366]">
                    <div 
                      className="bg-[#457b9d] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, imp * 100 * 2.8)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
