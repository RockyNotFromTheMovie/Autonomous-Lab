import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  Microscope,
  Copy,
  Check,
  Clock,
  Layers,
  FileText,
  Save,
} from 'lucide-react';
import { ExperimentRecord } from '../types';

interface ExperimentDetailModalProps {
  record: ExperimentRecord | null;
  onClose: () => void;
  onUpdateExplanation?: (recordId: string, explanation: string) => void;
}

export const ExperimentDetailModal: React.FC<ExperimentDetailModalProps> = ({
  record,
  onClose,
  onUpdateExplanation,
}) => {
  const [copied, setCopied] = useState(false);
  const [explanationText, setExplanationText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (record) {
      setExplanationText(record.explanation || '');
      setIsSaved(false);
    }
  }, [record]);

  if (!record) return null;

  const handleCopy = () => {
    const text = `Alloy: ${record.alloyName}\nElements: ${record.elements}\nOutcome: ${record.outcome}${
      record.explanation ? `\nExplanation: ${record.explanation}` : ''
    }\n\nSynthesis Plan:\n${record.synthesisPlan}\n\nCharacterization Plan:\n${record.characterizationPlan}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveExplanation = () => {
    if (onUpdateExplanation && record) {
      onUpdateExplanation(record.id, explanationText);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const isSuccess = record.outcome === 'Success';
  const isFail = record.outcome === 'Failure';
  const outcomeColor = isSuccess
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    : isFail
    ? 'text-red-400 border-red-500/30 bg-red-500/10'
    : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

  const isPartialOrFailure = record.outcome === 'Partial Success' || isFail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#38bdf8]" />
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                Experiment Record Details
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ID: {record.id.slice(0, 16)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h4 className="text-xl font-bold text-[#38bdf8] mb-1">
                {record.alloyName}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(record.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${outcomeColor}`}
            >
              {isSuccess && <CheckCircle2 className="w-3.5 h-3.5" />}
              {isFail && <XCircle className="w-3.5 h-3.5" />}
              {!isSuccess && !isFail && <AlertTriangle className="w-3.5 h-3.5" />}
              {record.outcome}
            </span>
          </div>

          {/* Explanation Section for Partial Success or Failure */}
          {isPartialOrFailure && (
            <div
              className={`p-4 rounded-xl border ${
                record.outcome === 'Partial Success'
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : 'bg-red-950/20 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <FileText className="w-4 h-4" />
                  <span>Outcome Explanation & Diagnostic Root Cause:</span>
                </div>
                {isSaved && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <Check className="w-3 h-3" /> Updated
                  </span>
                )}
              </div>

              <textarea
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
                placeholder={`Input explanation for ${record.outcome.toLowerCase()} (e.g., secondary phase precipitation, delamination, atomization mismatch)...`}
                rows={3}
                className="w-full bg-slate-900/90 text-xs text-white rounded-lg p-2.5 border border-slate-700 focus:outline-none focus:border-[#38bdf8] resize-none font-sans leading-relaxed mt-1"
              />

              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveExplanation}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Explanation</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1 uppercase font-mono tracking-wider">
              Selected Elements
            </span>
            <div className="flex flex-wrap gap-1.5">
              {record.elements.split(',').map((sym) => (
                <span
                  key={sym.trim()}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-600 rounded text-xs font-mono font-bold text-sky-300"
                >
                  {sym.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-800/40 border-l-2 border-purple-500 rounded p-3.5">
              <h5 className="text-xs font-semibold text-purple-400 mb-1.5 flex items-center gap-2">
                <Printer className="w-4 h-4" /> Synthesis Plan
              </h5>
              <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {record.synthesisPlan}
              </p>
            </div>

            <div className="bg-slate-800/40 border-l-2 border-blue-500 rounded p-3.5">
              <h5 className="text-xs font-semibold text-blue-400 mb-1.5 flex items-center gap-2">
                <Microscope className="w-4 h-4" /> Characterization Plan
              </h5>
              <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {record.characterizationPlan}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex justify-between items-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Recipe
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="bg-[#38bdf8] hover:bg-sky-400 text-slate-900 font-bold text-xs px-4 py-2 rounded transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
