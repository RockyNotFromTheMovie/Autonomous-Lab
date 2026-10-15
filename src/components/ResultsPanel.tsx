import React, { useState, useMemo } from 'react';
import {
  Server,
  Check,
  X,
  Minus,
  Clock,
  Download,
  Trash2,
  Filter,
  Eye,
  AlertTriangle,
  XCircle,
  FileText,
} from 'lucide-react';
import { ExperimentRecord, ExperimentOutcome } from '../types';

interface ResultsPanelProps {
  records: ExperimentRecord[];
  isLoading: boolean;
  onClearRecords: () => void;
  onSelectRecord: (record: ExperimentRecord) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  records,
  isLoading,
  onClearRecords,
  onSelectRecord,
}) => {
  const [filterOutcome, setFilterOutcome] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchOutcome =
        filterOutcome === 'all' || r.outcome === filterOutcome;
      const matchSearch =
        !search ||
        r.alloyName.toLowerCase().includes(search.toLowerCase()) ||
        r.elements.toLowerCase().includes(search.toLowerCase());
      return matchOutcome && matchSearch;
    });
  }, [records, filterOutcome, search]);

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `materials-experiments-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="col-span-1 md:col-span-5 glass-panel rounded-xl flex flex-col overflow-hidden shadow-lg border border-slate-700/50">
      {/* Header */}
      <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-[#38bdf8]" />
          Database & Results
        </h3>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <>
              <button
                onClick={handleExportJSON}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Export JSON"
              >
                <Download className="w-3 h-3 text-[#38bdf8]" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={onClearRecords}
                className="text-xs bg-slate-700/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear all stored runs"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      {records.length > 0 && (
        <div className="p-2.5 bg-slate-900/60 border-b border-slate-800 flex gap-2 items-center text-xs">
          <input
            type="text"
            placeholder="Filter database..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
          />
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="Success">Success</option>
              <option value="Partial Success">Partial</option>
              <option value="Failure">Failure</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Records Container */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-sm flex items-center justify-center gap-2">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Fetching data records...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center justify-center h-full">
            <Server className="w-8 h-8 text-slate-600 mb-2 stroke-[1.5]" />
            <p>
              {records.length === 0
                ? 'No records found. Execute an experiment to store data.'
                : 'No records matching filter.'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filtered.map((rec) => {
              const isSuccess = rec.outcome === 'Success';
              const isFail = rec.outcome === 'Failure';
              const badgeClass = isSuccess
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : isFail
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30';

              const timeStr = rec.timestamp
                ? new Date(rec.timestamp).toLocaleString()
                : 'Just now';

              return (
                <div
                  key={rec.id}
                  onClick={() => onSelectRecord(rec)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-3 hover:border-slate-500 transition-all cursor-pointer group hover:bg-slate-850"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 mr-2">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-white font-semibold text-sm group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                          {rec.alloyName}
                        </h4>
                        <Eye className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {rec.elements}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badgeClass}`}
                    >
                      {isSuccess && <Check className="w-3 h-3" />}
                      {isFail && <X className="w-3 h-3" />}
                      {!isSuccess && !isFail && <Minus className="w-3 h-3" />}
                      {rec.outcome}
                    </span>
                  </div>

                  {/* Outcome Explanation for Partial Success or Failure */}
                  {rec.explanation ? (
                    <div
                      className={`mt-2 p-2 rounded text-[11px] leading-relaxed border flex items-start gap-1.5 ${
                        rec.outcome === 'Partial Success'
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                          : 'bg-red-950/30 border-red-500/30 text-red-200'
                      }`}
                    >
                      {rec.outcome === 'Partial Success' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <span className="line-clamp-2 italic font-sans">
                        {rec.explanation}
                      </span>
                    </div>
                  ) : (rec.outcome === 'Partial Success' || isFail) ? (
                    <div className="mt-2 text-[10px] text-slate-500 italic flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span>Click to input outcome explanation</span>
                    </div>
                  ) : null}

                  <p className="text-[10px] text-slate-500 mt-2 text-right flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeStr}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
