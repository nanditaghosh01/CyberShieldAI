import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Lock, Globe, Server, AlertTriangle } from 'lucide-react';

export const ScanProgressModal = ({ url }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "SSRF & Safe Protocol Gate", desc: "Validating non-private IP, sanitizing URL target", icon: ShieldCheck },
    { title: "AI Phishing Classification", desc: "Extracting 24 structural features & running Gradient Boosting inference", icon: Cpu },
    { title: "SSL/TLS & Cryptographic Chain", desc: "Validating X.509 cert, issuer CA, key length, and CT logs", icon: Lock },
    { title: "Web Security & Header Audit", desc: "Inspecting HSTS, CSP, X-Frame-Options, cookies & server leaks", icon: Server },
    { title: "Threat Intelligence Feeds", desc: "Querying DNS records, known blacklists & reputation databases", icon: Globe },
    { title: "Multi-Factor Risk Scoring", desc: "Synthesizing unified 0-100 score & actionable remediation matrix", icon: AlertTriangle }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0c1424] border border-cyan-500/30 p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] relative overflow-hidden">
        {/* Animated Cyber Scanline */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-spin">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              CyberShield Deep Threat Analysis
            </h3>
            <p className="text-xs text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
              Target: <span className="text-cyan-300">{url}</span>
            </p>
          </div>
        </div>

        {/* Step progression */}
        <div className="space-y-3 my-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div 
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                    : isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                    : 'bg-[#080d18] border-slate-800 text-slate-600'
                }`}
              >
                <div className={`p-1.5 rounded-md mt-0.5 ${
                  isCurrent ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isCurrent ? 'text-cyan-300' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.title}
                    </span>
                    {isDone && <span className="text-[10px] text-emerald-400 font-mono">COMPLETE</span>}
                    {isCurrent && <span className="text-[10px] text-cyan-400 font-mono animate-pulse">ANALYZING...</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
          <span>Safe passive execution & zero offensive probing</span>
          <span className="font-mono text-cyan-400">Step {Math.min(currentStep + 1, steps.length)} of {steps.length}</span>
        </div>
      </div>
    </div>
  );
};

