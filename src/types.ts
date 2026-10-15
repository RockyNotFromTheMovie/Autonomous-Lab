export interface ElementData {
  AtomicNumber: string | number;
  Symbol: string;
  Name: string;
  AtomicMass?: string | number;
  StandardState?: string;
  GroupBlock?: string;
  ElectronConfiguration?: string;
  Electronegativity?: string | number;
  AtomicRadius?: string | number;
  IonizationEnergy?: string | number;
  MeltingPoint?: string | number;
  BoilingPoint?: string | number;
  Density?: string | number;
}

export interface AIPlan {
  alloyName: string;
  rationale: string;
  synthesisPlan: string;
  characterizationPlan: string;
}

export type ExperimentOutcome = 'Success' | 'Partial Success' | 'Failure';

export interface DiagnosticData {
  anomaly: string;
  evidence: string;
  recommendation: string;
}

export interface ExperimentRecord {
  id: string;
  alloyName: string;
  elements: string;
  selectedElements?: ElementData[];
  synthesisPlan: string;
  characterizationPlan: string;
  outcome: ExperimentOutcome;
  explanation?: string;
  diagnostic?: DiagnosticData;
  timestamp: number;
}

export type LogType = 'info' | 'llm' | 'hardware' | 'success' | 'error';

export interface LogMessage {
  id: string;
  text: string;
  type: LogType;
  timestamp: string;
}

export type SimStage = 'idle' | 'synthesizing' | 'characterizing' | 'analyzing' | 'completed';
