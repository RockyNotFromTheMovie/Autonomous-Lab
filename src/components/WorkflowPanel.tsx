import React, { useEffect, useRef } from 'react';
import {
  Bot,
  Network,
  Printer,
  Microscope,
  Play,
  Flame,
  LineChart,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Terminal,
  Trash2,
} from 'lucide-react';
import { ElementData, AIPlan, SimStage, ExperimentOutcome, LogMessage } from '../types';

interface WorkflowPanelProps {
  currentPlan: AIPlan | null;
  selectedElements: ElementData[];
  simStage: SimStage;
  simProgress: number;
  simOutcome: ExperimentOutcome | null;
  onExecuteExperiment: () => void;
  onResetWorkflow: () => void;
  logs: LogMessage[];
  onClearLogs: () => void;
}

export const WorkflowPanel: React.FC<WorkflowPanelProps> = ({
  currentPlan,
  selectedElements,
  simStage,
  simProgress,
  simOutcome,
  onExecuteExperiment,
  onResetWorkflow,
  logs,
  onClearLogs,
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Determine glow style
  const getGlowClasses = () => {
    if (simStage === 'idle') return 'opacity-0';
    if (simStage === 'synthesizing') return 'opacity-20 bg-amber-500';
    if (simStage === 'characterizing') return 'opacity-20 bg-blue-500';
    if (simStage === 'analyzing') return 'opacity-20 bg-purple-500';
    if (simStage === 'completed') {
      if (simOutcome === 'Success') return 'opacity-15 bg-emerald-500';
      if (simOutcome === 'Failure') return 'opacity-15 bg-red-500';
      return 'opacity-15 bg-amber-500';
    }
    return 'opacity-0';
  };

  return (
    <div className="col-span-1 md:col-span-4 glass-panel rounded-xl flex flex-col overflow-hidden shadow-lg border border-slate-700/50 relative">
      {/* Background glow for hardware sim */}
      <div
        className={`absolute inset-0 blur-[100px] transition-all duration-700 pointer-events-none ${getGlowClasses()}`}
      />

      {/* Header */}
      <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex justify-between items-center z-10 relative">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#38bdf8]" />
          Autonomous Workflow
        </h3>
        {simStage !== 'idle' && (
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-400">
            {simStage}
          </span>
        )}
      </div>

      {/* Main Workflow Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 z-10 relative">
        {/* Case 1: Empty state */}
        {!currentPlan && simStage === 'idle' && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-60">
            <Network className="w-12 h-12 mb-3 stroke-[1.5]" />
            <p className="text-sm">Select 2-5 elements and request an AI design to begin.</p>
          </div>
        )}

        {/* Case 2: Plan generated, ready to execute */}
        {currentPlan && simStage === 'idle' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
              <h4 className="text-[#38bdf8] font-bold text-lg mb-1">
                {currentPlan.alloyName}
              </h4>
              <p className="text-xs text-slate-300 italic mb-3">
                {currentPlan.rationale}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {selectedElements.map((e) => (
                  <span
                    key={e.Symbol}
                    className="px-2 py-0.5 bg-slate-800 text-xs rounded border border-slate-600 font-mono text-slate-200"
                  >
                    {e.Symbol} ({e.Name})
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="bg-slate-800/50 p-3 rounded border-l-2 border-purple-500">
                <h5 className="text-xs font-semibold text-purple-400 mb-1 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5" /> Synthesis Plan
                </h5>
                <p className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {currentPlan.synthesisPlan}
                </p>
              </div>

              <div className="bg-slate-800/50 p-3 rounded border-l-2 border-blue-500">
                <h5 className="text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1.5">
                  <Microscope className="w-3.5 h-3.5" /> Characterization Plan
                </h5>
                <p className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {currentPlan.characterizationPlan}
                </p>
              </div>
            </div>

            <button
              onClick={onExecuteExperiment}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-2.5 px-4 rounded transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Execute Experiment
            </button>
          </div>
        )}

        {/* Case 3: Simulation running */}
        {(simStage === 'synthesizing' ||
          simStage === 'characterizing' ||
          simStage === 'analyzing') && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="relative">
              <div
                className={`w-24 h-24 border-4 rounded-full animate-spin ${
                  simStage === 'synthesizing'
                    ? 'border-slate-700 border-t-amber-400'
                    : simStage === 'characterizing'
                    ? 'border-slate-700 border-t-blue-400'
                    : 'border-slate-700 border-t-purple-400'
                }`}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {simStage === 'synthesizing' && (
                  <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
                )}
                {simStage === 'characterizing' && (
                  <Microscope className="w-8 h-8 text-blue-400 animate-pulse" />
                )}
                {simStage === 'analyzing' && (
                  <LineChart className="w-8 h-8 text-purple-400 animate-pulse" />
                )}
              </div>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <p
                className={`font-mono text-sm font-bold uppercase tracking-widest ${
                  simStage === 'synthesizing'
                    ? 'text-amber-400'
                    : simStage === 'characterizing'
                    ? 'text-blue-400'
                    : 'text-purple-400'
                }`}
              >
                {simStage === 'synthesizing'
                  ? 'Synthesizing...'
                  : simStage === 'characterizing'
                  ? 'Characterizing...'
                  : 'Analyzing...'}
              </p>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    simStage === 'synthesizing'
                      ? 'bg-amber-400'
                      : simStage === 'characterizing'
                      ? 'bg-blue-400'
                      : 'bg-purple-400'
                  }`}
                  style={{ width: `${simProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Stage {simStage === 'synthesizing' ? '1/3' : simStage === 'characterizing' ? '2/3' : '3/3'} ({simProgress}%)
              </span>
            </div>
          </div>
        )}

        {/* Case 4: Simulation complete */}
        {simStage === 'completed' && simOutcome && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn py-4">
            <div className="mb-4">
              {simOutcome === 'Success' && (
                <CheckCircle2 className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
              )}
              {simOutcome === 'Partial Success' && (
                <AlertTriangle className="w-16 h-16 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
              )}
              {simOutcome === 'Failure' && (
                <XCircle className="w-16 h-16 text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">
              {simOutcome}
            </h3>
            <p className="text-xs text-slate-400 mb-6 max-w-xs">
              Experiment concluded. Protocol and telemetry synchronized to database.
            </p>

            <button
              onClick={onResetWorkflow}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> New Experiment
            </button>
          </div>
        )}
      </div>

      {/* Log Console */}
      <div className="h-44 bg-slate-900 border-t border-slate-700 flex flex-col z-10 relative">
        <div className="bg-slate-800/60 px-3 py-1.5 flex justify-between items-center text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <span className="flex items-center gap-1.5 font-mono">
            <Terminal className="w-3 h-3 text-[#38bdf8]" />
            System Logs
          </span>
          <button
            onClick={onClearLogs}
            className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-[10px] transition-colors cursor-pointer"
            title="Clear console"
          >
            <Trash2 className="w-2.5 h-2.5" /> Clear
          </button>
        </div>

        <div
          ref={logContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-2 font-mono text-[11px] space-y-1 select-text"
        >
          {logs.map((log) => {
            let color = 'text-slate-400';
            if (log.type === 'llm') color = 'text-purple-400';
            if (log.type === 'hardware') color = 'text-amber-400';
            if (log.type === 'success') color = 'text-emerald-400';
            if (log.type === 'error') color = 'text-red-400';

            return (
              <div key={log.id} className={`${color} leading-relaxed transition-all duration-300`}>
                <span className="text-slate-600 select-none mr-1.5">[{log.timestamp}]</span>
                <span>&gt; {log.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
