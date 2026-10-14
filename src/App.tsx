import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { ElementsPanel } from './components/ElementsPanel';
import { WorkflowPanel } from './components/WorkflowPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { ExperimentDetailModal } from './components/ExperimentDetailModal';
import { ElementData, AIPlan, ExperimentRecord, LogMessage, SimStage, ExperimentOutcome } from './types';
import { STANDARD_ELEMENTS } from './data/standardElements';
import { generateAIPlan } from './services/aiMaterialsService';

const STORAGE_KEY = 'autonomous_materials_lab_experiments_v2';

const SEED_RECORDS: ExperimentRecord[] = [
  {
    id: 'seed-exp-101',
    alloyName: 'Li0.6Ni0.2Co0.1Mn0.1O2 (Intercalation Energy Storage Matrix)',
    elements: 'Li, Ni, Co, Mn, O',
    synthesisPlan: '1. Precursor: Colloidal acetate salts in triethylene glycol.\n2. Ultrasonic Atomization: 2.4 MHz continuous ink feed.\n3. Deposition: 50 nm gradient thin films on passivated sapphire.\n4. Annealing: Pulsed xenon flash sintering at 14.5 J/cm² under argon shroud.',
    characterizationPlan: '1. Micro-XRF: 15 μm spot size, 50 kV excitation mapping 10x10 array.\n2. FE-SEM: 10 kV secondary electron detector for necking analysis.\n3. EDX cross-section: Confirmed phase purity without dendrite nucleation.',
    outcome: 'Success',
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 'seed-exp-102',
    alloyName: 'Ti3AlC2 (Nanostructured MAX-Phase Variant)',
    elements: 'Ti, Al, C',
    synthesisPlan: '1. Ball milling elemental powders with 1 wt% stearic acid.\n2. Spark plasma sintering at 1250°C under 30 MPa uniaxial pressure.\n3. Post-synthesis rapid thermal quenching.',
    characterizationPlan: '1. XRF mapping stoichiometry Ti:Al:C ratio.\n2. SEM micrographs of laminated nanolayers showing basal plane sliding.',
    outcome: 'Partial Success',
    timestamp: Date.now() - 3600000 * 5,
  }
];

export const App: React.FC = () => {
  const [elements, setElements] = useState<ElementData[]>(STANDARD_ELEMENTS);
  const [selectedElements, setSelectedElements] = useState<ElementData[]>(() => {
    // Select 3 initial elements so the user sees a lively starting point
    return STANDARD_ELEMENTS.filter(e => ['Li', 'Ni', 'Mn'].includes(e.Symbol));
  });

  const [isDesigning, setIsDesigning] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AIPlan | null>(null);

  const [simStage, setSimStage] = useState<SimStage>('idle');
  const [simProgress, setSimProgress] = useState(0);
  const [simOutcome, setSimOutcome] = useState<ExperimentOutcome | null>(null);

  const [records, setRecords] = useState<ExperimentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load experiments from localStorage', e);
    }
    return SEED_RECORDS;
  });

  const [selectedModalRecord, setSelectedModalRecord] = useState<ExperimentRecord | null>(null);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'local'>('connecting');

  const [logs, setLogs] = useState<LogMessage[]>([
    {
      id: 'log-0',
      text: 'System ready. Awaiting inputs.',
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Initial DB connection status simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDbStatus('connected');
      addLog('Laboratory database storage connected and synchronized.', 'info');
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Save records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving records to localStorage', e);
    }
  }, [records]);

  const addLog = useCallback(
    (text: string, type: 'info' | 'llm' | 'hardware' | 'success' | 'error' = 'info') => {
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          text,
          type,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    },
    []
  );

  const handleElementsLoaded = (newElements: ElementData[], filename: string) => {
    setElements(newElements);
    setSelectedElements([]);
    addLog(`Loaded dataset: ${filename} (${newElements.length} elements)`, 'info');
  };

  const handleToggleElement = (element: ElementData) => {
    setSelectedElements((prev) => {
      const exists = prev.some((e) => e.Symbol === element.Symbol);
      if (exists) {
        addLog(`Deselected element ${element.Symbol} (${element.Name})`);
        return prev.filter((e) => e.Symbol !== element.Symbol);
      } else {
        if (prev.length >= 5) {
          addLog(`Maximum limit reached: 5 elements allowed`, 'error');
          return prev;
        }
        addLog(`Selected element ${element.Symbol} (${element.Name})`);
        return [...prev, element];
      }
    });
  };

  const handleDesignPlan = async () => {
    if (selectedElements.length < 2 || selectedElements.length > 5) {
      addLog('Selection error: You must select 2 to 5 elements.', 'error');
      return;
    }

    setIsDesigning(true);
    addLog(`Querying LLM with ${selectedElements.length} elements...`, 'llm');

    try {
      const plan = await generateAIPlan(selectedElements);
      setCurrentPlan(plan);
      addLog(`AI Design Complete: ${plan.alloyName}`, 'llm');
    } catch (err: any) {
      addLog(`LLM Error: ${err.message || 'Generation failed'}`, 'error');
    } finally {
      setIsDesigning(false);
    }
  };

  const handleExecuteExperiment = async () => {
    if (!currentPlan) return;

    addLog('Initiating physical protocol...', 'hardware');
    setSimStage('synthesizing');
    setSimProgress(10);

    // Step 1: Synthesizing
    await new Promise((r) => setTimeout(r, 1400));
    setSimProgress(33);

    // Step 2: Characterizing
    setSimStage('characterizing');
    addLog('Micro-XRF and SEM mapping engaged...', 'hardware');
    await new Promise((r) => setTimeout(r, 1800));
    setSimProgress(66);

    // Step 3: Analyzing
    setSimStage('analyzing');
    addLog('Processing spectral data against hypothesis...', 'hardware');
    await new Promise((r) => setTimeout(r, 1400));
    setSimProgress(100);

    // Determine Result
    const outcomes: ExperimentOutcome[] = ['Success', 'Partial Success', 'Failure'];
    // 60% chance success, 25% partial, 15% failure for rewarding lab simulation
    const rand = Math.random();
    const finalOutcome: ExperimentOutcome =
      rand < 0.6 ? 'Success' : rand < 0.85 ? 'Partial Success' : 'Failure';

    setSimOutcome(finalOutcome);
    setSimStage('completed');

    if (finalOutcome === 'Success') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#10b981', '#a855f7'],
      });
    }

    const logType =
      finalOutcome === 'Failure'
        ? 'error'
        : finalOutcome === 'Success'
        ? 'success'
        : 'hardware';
    addLog(`Hardware returned status: ${finalOutcome}`, logType);

    // Save record
    const newRecord: ExperimentRecord = {
      id: `exp-${Date.now()}`,
      alloyName: currentPlan.alloyName,
      elements: selectedElements.map((e) => e.Symbol).join(', '),
      selectedElements,
      synthesisPlan: currentPlan.synthesisPlan,
      characterizationPlan: currentPlan.characterizationPlan,
      outcome: finalOutcome,
      timestamp: Date.now(),
    };

    setRecords((prev) => [newRecord, ...prev]);
    addLog('Record synchronized to database.', 'info');
  };

  const handleResetWorkflow = () => {
    setCurrentPlan(null);
    setSimStage('idle');
    setSimProgress(0);
    setSimOutcome(null);
    addLog('Ready for new synthesis parameters.', 'info');
  };

  const handleClearRecords = () => {
    if (window.confirm?.('Clear all experimental records from storage?')) {
      setRecords([]);
      addLog('All experiment records purged.', 'info');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden bg-[#0b1120] text-[#f8fafc] selection:bg-[#38bdf8] selection:text-white">
      {/* Header */}
      <Header dbStatus={dbStatus} totalExperiments={records.length} />

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 overflow-hidden min-h-0">
        {/* Column 1: Elements Database */}
        <ElementsPanel
          elements={elements}
          onElementsLoaded={handleElementsLoaded}
          selectedElements={selectedElements}
          onToggleElement={handleToggleElement}
          onDesignPlan={handleDesignPlan}
          isDesigning={isDesigning}
          onLog={addLog}
        />

        {/* Column 2: Agent Control & Hardware Sim */}
        <WorkflowPanel
          currentPlan={currentPlan}
          selectedElements={selectedElements}
          simStage={simStage}
          simProgress={simProgress}
          simOutcome={simOutcome}
          onExecuteExperiment={handleExecuteExperiment}
          onResetWorkflow={handleResetWorkflow}
          logs={logs}
          onClearLogs={() => setLogs([])}
        />

        {/* Column 3: Experiment Results DB */}
        <ResultsPanel
          records={records}
          isLoading={false}
          onClearRecords={handleClearRecords}
          onSelectRecord={(rec) => setSelectedModalRecord(rec)}
        />
      </main>

      {/* Modal for detail view */}
      <ExperimentDetailModal
        record={selectedModalRecord}
        onClose={() => setSelectedModalRecord(null)}
      />
    </div>
  );
};
