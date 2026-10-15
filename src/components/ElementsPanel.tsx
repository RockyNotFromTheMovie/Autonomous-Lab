import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { ElementData } from '../types';
import { Table, Search, Brain, Upload, Sparkles, X, XCircle, RotateCcw } from 'lucide-react';
import { STANDARD_ELEMENTS } from '../data/standardElements';

interface ElementsPanelProps {
  elements: ElementData[];
  onElementsLoaded: (elements: ElementData[], filename: string) => void;
  selectedElements: ElementData[];
  onToggleElement: (element: ElementData) => void;
  onDeselectAll: () => void;
  onDeselectElement: (element: ElementData) => void;
  onDesignPlan: () => void;
  isDesigning: boolean;
  onLog: (msg: string, type?: 'info' | 'llm' | 'hardware' | 'success' | 'error') => void;
}

export const ElementsPanel: React.FC<ElementsPanelProps> = ({
  elements,
  onElementsLoaded,
  selectedElements,
  onToggleElement,
  onDeselectAll,
  onDeselectElement,
  onDesignPlan,
  isDesigning,
  onLog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onLog(`Reading ${file.name}...`);
    Papa.parse<ElementData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid = results.data.filter(
          (row) => row.AtomicNumber && row.Symbol && row.Name
        );
        if (valid.length > 0) {
          onElementsLoaded(valid, file.name);
          onLog(`Parsed ${valid.length} elements from CSV.`, 'success');
        } else {
          onLog(`CSV contains no valid elements. Required headers: AtomicNumber, Symbol, Name`, 'error');
        }
      },
      error: (err) => {
        onLog(`CSV Error: ${err.message}`, 'error');
      },
    });
  };

  const handleLoadStandardElements = () => {
    onElementsLoaded(STANDARD_ELEMENTS, 'Periodic Table (Standard)');
    onLog(`Loaded ${STANDARD_ELEMENTS.length} elements from standard reference library.`, 'success');
  };

  const filteredElements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return elements;
    return elements.filter(
      (el) =>
        (el.Name && el.Name.toLowerCase().includes(q)) ||
        (el.Symbol && el.Symbol.toLowerCase().includes(q)) ||
        (el.GroupBlock && el.GroupBlock.toLowerCase().includes(q))
    );
  }, [elements, searchQuery]);

  const count = selectedElements.length;
  const isValidCount = count >= 2 && count <= 5;

  return (
    <div className="col-span-1 md:col-span-3 glass-panel rounded-xl flex flex-col overflow-hidden shadow-lg border border-slate-700/50">
      {/* Top Header & Search Area */}
      <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-[#38bdf8]" />
            Elements Database
          </h3>
          {elements.length === 0 && (
            <button
              onClick={handleLoadStandardElements}
              className="text-[11px] text-[#38bdf8] hover:text-sky-300 font-mono flex items-center gap-1 transition-colors underline cursor-pointer"
              title="Quick-load 118 periodic table elements"
            >
              <Sparkles className="w-3 h-3" /> Quick Load
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="block text-xs text-slate-400 font-medium">
            Upload PubChemElements_all.csv
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#38bdf8]/20 file:text-[#38bdf8] hover:file:bg-[#38bdf8]/30 cursor-pointer border border-slate-700 rounded bg-slate-900"
            />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={elements.length === 0}
            className="w-full bg-slate-900 text-xs text-white rounded pl-8 pr-3 py-2 border border-slate-600 focus:outline-none focus:border-[#38bdf8] transition-colors disabled:opacity-50"
          />
        </div>

        {/* Selection Status & Deselect option */}
        <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span>
              Selected:{' '}
              <span
                className={`font-bold ${
                  isValidCount
                    ? 'text-emerald-400'
                    : count > 5
                    ? 'text-red-400'
                    : 'text-white'
                }`}
              >
                {count}
              </span>
              /5
            </span>
            {count > 0 && (
              <button
                onClick={onDeselectAll}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-mono transition-colors hover:underline cursor-pointer"
                title="Deselect all chosen elements"
              >
                <X className="w-3 h-3" />
                <span>Deselect</span>
              </button>
            )}
          </div>
          <span
            className={`text-amber-400 text-[11px] ${
              isValidCount ? 'hidden' : 'block'
            }`}
          >
            Select 2-5 elements
          </span>
        </div>
      </div>

      {/* Selected Element Chips Bar with individual Deselect buttons */}
      {selectedElements.length > 0 && (
        <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-700/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            <span className="text-[10px] uppercase font-mono text-slate-500 shrink-0">Selected:</span>
            {selectedElements.map((el) => (
              <span
                key={el.Symbol}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-mono group"
              >
                <span className="font-bold">{el.Symbol}</span>
                <button
                  type="button"
                  onClick={() => onDeselectElement(el)}
                  className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
                  title={`Deselect ${el.Symbol} (${el.Name})`}
                  aria-label={`Deselect ${el.Symbol}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onDeselectAll}
            className="text-[11px] text-red-400 hover:text-red-300 font-mono flex items-center gap-1 px-2 py-0.5 rounded hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
            title="Deselect all selected elements"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* Elements Table */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-800/90 sticky top-0 backdrop-blur z-10 text-slate-400 shadow-md">
            <tr>
              <th className="p-2 w-10 text-center">
                {count > 0 ? (
                  <button
                    type="button"
                    onClick={onDeselectAll}
                    className="text-red-400 hover:text-red-300 p-0.5 rounded hover:bg-red-500/20 transition-colors cursor-pointer mx-auto block"
                    title="Deselect all selected elements"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] uppercase font-mono">Sel</span>
                )}
              </th>
              <th className="p-2">Sym</th>
              <th className="p-2">Name</th>
              <th className="p-2">Block</th>
              <th className="p-2 w-20 text-right">Option</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {elements.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-slate-600 mb-1" />
                    <span>Please upload CSV to load elements.</span>
                    <button
                      onClick={handleLoadStandardElements}
                      className="mt-2 text-xs bg-slate-800 hover:bg-slate-700 text-[#38bdf8] border border-slate-600 px-3 py-1.5 rounded transition-all cursor-pointer font-sans"
                    >
                      Or load Periodic Table Elements
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredElements.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">
                  No matches found.
                </td>
              </tr>
            ) : (
              filteredElements.map((el) => {
                const isSelected = selectedElements.some((s) => s.Symbol === el.Symbol);
                return (
                  <tr
                    key={el.Symbol}
                    onClick={() => onToggleElement(el)}
                    className={`hover:bg-slate-700/30 transition-colors cursor-pointer select-none group ${
                      isSelected ? 'bg-sky-500/10' : ''
                    }`}
                  >
                    <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleElement(el)}
                        className="w-3.5 h-3.5 accent-[#38bdf8] bg-slate-800 border-slate-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-2 font-mono text-[#38bdf8] font-bold">
                      {el.Symbol}
                    </td>
                    <td className="p-2 text-slate-200">{el.Name}</td>
                    <td className="p-2 text-slate-400 text-[11px]">
                      {el.GroupBlock || '-'}
                    </td>
                    <td className="p-2 text-right" onClick={(e) => e.stopPropagation()}>
                      {isSelected ? (
                        <button
                          type="button"
                          onClick={() => onDeselectElement(el)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all cursor-pointer shadow-sm"
                          title={`Deselect ${el.Symbol}`}
                        >
                          <X className="w-2.5 h-2.5" />
                          <span>Deselect</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleElement(el)}
                          disabled={count >= 5}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                            count >= 5
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'text-slate-400 hover:text-sky-300 hover:bg-slate-700/50'
                          }`}
                          title={count >= 5 ? 'Maximum 5 elements' : `Select ${el.Symbol}`}
                        >
                          Select
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-800/80 border-t border-slate-700">
        <button
          onClick={onDesignPlan}
          disabled={!isValidCount || isDesigning}
          className="w-full bg-[#38bdf8] hover:bg-blue-400 text-slate-900 font-bold py-2 px-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(56,189,248,0.3)] flex justify-center items-center gap-2 cursor-pointer"
        >
          {isDesigning ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> Processing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" /> Design AI Material Plan
            </>
          )}
        </button>
      </div>
    </div>
  );
};
