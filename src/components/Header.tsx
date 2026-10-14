import React from 'react';
import { Microscope, Database, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  dbStatus: 'connecting' | 'connected' | 'local';
  totalExperiments: number;
}

export const Header: React.FC<HeaderProps> = ({ dbStatus, totalExperiments }) => {
  return (
    <header className="glass-panel border-b border-slate-700/50 p-4 flex justify-between items-center z-10 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-600 shadow-inner">
          <Microscope className="text-[#38bdf8] w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#38bdf8] to-blue-400">
              Agentic Materials Lab
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider rounded bg-sky-500/10 text-[#38bdf8] border border-sky-500/20">
              Autonomous
            </span>
          </div>
          <p className="text-xs text-slate-400">Autonomous Discovery Protocol v2.0</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {totalExperiments > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700/80 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Runs: <strong className="text-white">{totalExperiments}</strong></span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              dbStatus === 'connected'
                ? 'bg-emerald-500'
                : dbStatus === 'connecting'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-300 font-mono text-xs">
            {dbStatus === 'connected'
              ? 'Connected'
              : dbStatus === 'connecting'
              ? 'Connecting...'
              : 'Local Mode'}
          </span>
        </div>
      </div>
    </header>
  );
};
