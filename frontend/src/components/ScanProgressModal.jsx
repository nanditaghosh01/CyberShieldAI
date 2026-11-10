import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Lock, Globe, Server, CheckCircle2, Loader2 } from 'lucide-react';

export const ScanProgressModal = ({ url }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Verifying link safety & address", desc: "Checking protocol safety, format, and avoiding internal IP traps", icon: ShieldCheck },
    { title: "Detecting deceptive lookalikes & phishing", desc: "Checking typosquatting, keywords, and domain similarity", icon: Cpu },
    { title: "Verifying SSL certificate & encryption", desc: "Auditing issuing authority, expiration, and certificate logs", icon: Lock },
    { title: "Reviewing browser defense headers", desc: "Checking protections against clickjacking, script injection, and leaks", icon: Server },
    { title: "Consulting global threat registries", desc: "Cross-referencing Safe Browsing, VirusTotal, and URLhaus feeds", icon: Globe },
    { title: "Compiling safety report", desc: "Synthesizing transparent findings and practical recommendations", icon: CheckCircle2 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#122035] border border-[#274366] p-6 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#182b45] border border-[#457b9d]/60 text-[#a9d8de]">
            <Loader2 className="w-5 h-5 animate-spin text-[#a9d8de]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#f3fbf0] tracking-tight">
              Checking website safety...
            </h3>
            <p className="text-xs text-[#a9d8de]/70 truncate max-w-xs sm:max-w-md">
              Target: <span className="text-[#f3fbf0] font-mono">{url}</span>
            </p>
          </div>
        </div>

        {/* Step progression */}
        <div className="space-y-2.5 my-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div 
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  isCurrent 
                    ? 'bg-[#182b45] border-[#457b9d] shadow-sm' 
                    : isDone
                    ? 'bg-[#122035] border-[#274366] text-[#a9d8de]'
                    : 'bg-[#0b1523]/50 border-transparent text-[#457b9d]/40'
                }`}
              >
                <div className={`p-1.5 rounded-lg mt-0.5 ${
                  isCurrent ? 'bg-[#457b9d] text-[#0b1523]' : isDone ? 'bg-[#182b45] text-[#a9d8de]' : 'bg-[#0b1523] text-[#457b9d]/50'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isCurrent ? 'text-[#f3fbf0]' : isDone ? 'text-[#a9d8de]' : 'text-[#457b9d]/60'}`}>
                      {step.title}
                    </span>
                    {isDone && <span className="text-[11px] text-[#a9d8de] font-medium">Done</span>}
                    {isCurrent && <span className="text-[11px] text-[#457b9d] font-medium">Checking...</span>}
                  </div>
                  <p className="text-[11px] text-[#a9d8de]/70 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-[#a9d8de]/70 pt-3 border-t border-[#274366]">
          <span>Safe passive analysis – no personal data collected</span>
          <span className="font-medium text-[#f3fbf0]">{Math.min(currentStep + 1, steps.length)} of {steps.length}</span>
        </div>
      </div>
    </div>
  );
};
