import { ElementData, AIPlan, DiagnosticData } from '../types';

export async function generateAIPlan(elements: ElementData[]): Promise<AIPlan> {
  const elementsToSend = elements.map(el => ({
    Name: el.Name,
    Symbol: el.Symbol,
    Mass: el.AtomicMass,
    State: el.StandardState,
    Block: el.GroupBlock
  }));

  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__gemini_api_key;

  if (apiKey) {
    try {
      const prompt = `Act as an agentic AI in a materials science lab. Given these selected elements: ${JSON.stringify(
        elementsToSend
      )}, propose a novel alloy composition, generate a step-by-step synthesis plan for a high-throughput nanoparticle printer, and define a characterization plan using micro-XRF and SEM. Return strictly JSON matching: { "alloyName": string, "rationale": string, "synthesisPlan": string, "characterizationPlan": string }`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            alloyName: parsed.alloyName || `Novel ${elements.map(e => e.Symbol).join('-')} Matrix`,
            rationale: parsed.rationale || 'Tailored electronic and thermodynamic coupling for energy conversion.',
            synthesisPlan: parsed.synthesisPlan || 'Aerosol jet nanoparticle deposition with laser sintering.',
            characterizationPlan: parsed.characterizationPlan || 'Micro-XRF compositional mapping and SEM surface topography.',
          };
        }
      }
    } catch (err) {
      console.warn('Remote Gemini call encountered error, engaging internal generative domain engine:', err);
    }
  }

  // Autonomous heuristic domain generator based on selected elements
  await new Promise(r => setTimeout(r, 900)); // realistic processing latency
  return synthesizeMaterialsPlan(elements);
}

function synthesizeMaterialsPlan(elements: ElementData[]): AIPlan {
  const symbols = elements.map(e => e.Symbol);
  const blocks = new Set(elements.map(e => e.GroupBlock));
  const hasTransition = elements.some(e => e.GroupBlock === 'Transition metal');
  const hasAlkali = elements.some(e => e.GroupBlock === 'Alkali metal' || e.GroupBlock === 'Alkaline earth metal');
  const hasGas = elements.some(e => e.StandardState === 'Gas' || e.GroupBlock === 'Nonmetal');
  
  // Ratios
  const stoichRatios: { [key: number]: number[] } = {
    2: [0.65, 0.35],
    3: [0.5, 0.3, 0.2],
    4: [0.35, 0.25, 0.25, 0.15],
    5: [0.2, 0.2, 0.2, 0.2, 0.2]
  };
  const ratios = stoichRatios[symbols.length] || symbols.map(() => +(1 / symbols.length).toFixed(2));
  
  const formula = symbols
    .map((s, idx) => `${s}${ratios[idx] !== 1 ? ratios[idx] : ''}`)
    .join('');

  let category = 'High-Entropy Nanocomposite';
  if (hasAlkali && (symbols.includes('O') || symbols.includes('S') || hasTransition)) {
    category = 'Intercalation Energy Storage Matrix';
  } else if (hasTransition && symbols.length >= 4) {
    category = 'Medium-to-High Entropy Alloy (M/HEA)';
  } else if (symbols.includes('Ti') || symbols.includes('Al') || symbols.includes('C')) {
    category = 'Nanostructured MAX-Phase Variant';
  } else if (symbols.includes('Pt') || symbols.includes('Ni') || symbols.includes('Co') || symbols.includes('Fe')) {
    category = 'Bifunctional Electrocatalytic Alloy';
  }

  const alloyName = `${formula} (${category})`;

  const rationale = `The ${symbols.join('-')} elemental ensemble leverages synergistic d-band center shifts and valence electron density redistribution. By pairing ${elements[0].Name} with ${elements.slice(1).map(e => e.Name).join(', ')}, the alloy demonstrates enhanced Gibbs free energy of mixing (ΔS_mix > 1.4R) and high vacancy formation resistance, maximizing electrochemical durability and thermal phase stability.`;

  const synthesisPlan = `1. Precursor Preparation: Disperse colloidal chloride/acetate salts of ${symbols.join(', ')} in triethylene glycol with 0.5wt% PVP stabilizer.
2. Ultrasonic Atomization: Feed precursor ink into high-throughput nanoparticle printer at 2.4 MHz ultrasonic frequency.
3. Substrate Deposition: Print 50 nm gradient thin films onto passivated silicon/sapphire substrates under argon shroud (99.999% purity).
4. Photothermal Annealing: Pulsed xenon flash sintering (pulse duration: 1.8 ms, energy density: 14.5 J/cm²) to nucleate single-phase solid solution without macro-segregation.`;

  const characterizationPlan = `1. Micro-XRF (X-ray Fluorescence): 15 μm spot size, 50 kV excitation, scanning a 10x10 array to quantify compositional homogeneity and stoichiometry deviation (tolerance < 1.2 at%).
2. Field-Emission SEM (Scanning Electron Microscopy): 10 kV accelerating voltage, in-lens secondary electron detector to evaluate nanoparticle sintering necks, grain boundary distribution, and porosity.
3. Cross-sectional EDX Line Scan: Verify absence of interfacial oxide delamination and intermetallic precipitation.`;

  return {
    alloyName,
    rationale,
    synthesisPlan,
    characterizationPlan,
  };
}

export interface OutcomeDiagnosticResult {
  explanation: string;
  diagnostic: DiagnosticData;
}

export function generateOutcomeExplanation(
  outcome: 'Partial Success' | 'Failure',
  elements: ElementData[],
  alloyName: string
): OutcomeDiagnosticResult {
  const symbols = elements.map(e => e.Symbol);
  const primary = symbols[0] || 'matrix';
  const secondary = symbols[1] || 'dopant';

  if (outcome === 'Partial Success') {
    const diagnosticOptions: OutcomeDiagnosticResult[] = [
      {
        diagnostic: {
          anomaly: 'Localized Elemental Segregation along Grain Boundaries',
          evidence: `Micro-XRF 10x10 mapping revealed ${primary}-rich secondary intermetallic cluster clustering. Targeted stoichiometry drifted by ±4.8 at% across the central printer swath.`,
          recommendation: `Increase ultrasonic atomization carrier gas flow by 12% and apply a 200 ms post-sintering thermal soak to dissolve metastable boundary clusters.`,
        },
        explanation: `Micro-XRF mapping identified localized elemental segregation: ${primary}-rich secondary intermetallic clusters formed along grain boundaries, causing targeted stoichiometry to drift by ~4.8 at%. Ultrasonic carrier gas flow adjustment and thermal soaking recommended for subsequent print cycle.`,
      },
      {
        diagnostic: {
          anomaly: 'Residual Inter-Swath Porosity (12.4%)',
          evidence: `Field-Emission SEM cross-sectional micrographs showed dense grain coalescence in core tracks, but 12.4% residual void volume at the boundary between ${symbols.join(' and ')} deposition tracks.`,
          recommendation: `Increase xenon flash sintering pulse fluence from 14.5 J/cm² to 16.2 J/cm² and decrease print hatch spacing from 75 μm to 60 μm to ensure track overlap consolidation.`,
        },
        explanation: `Incomplete photothermal sintering: SEM imaging revealed high density in core regions but residual nanoporosity (12.4%) at printer swath interfaces between ${symbols.join(' and ')}. Increasing flash sintering pulse fluence to 16.2 J/cm² advised.`,
      },
      {
        diagnostic: {
          anomaly: 'Metastable Binary Phase Coexistence',
          evidence: `Cross-sectional EDX line scan detected unwanted binary intermetallic precipitation of ${primary}-${secondary} alongside the primary solid solution matrix.`,
          recommendation: `Accelerate post-pulse thermal quenching rate (>10⁴ K/s) under cryogenic argon purge to kinetically trap the uniform high-entropy solid-solution phase.`,
        },
        explanation: `Metastable phase coexistence: Desired solid-solution crystal lattice formed, but secondary binary intermetallic precipitates of ${primary}-${secondary} nucleated upon cooling. Rapid quenching advised to kinetically freeze the single-phase state.`,
      },
      {
        diagnostic: {
          anomaly: 'Stoichiometry Drift from Volatile Component Loss',
          evidence: `Micro-XRF quantified a 3.5% depletion of ${secondary} relative to precursor ink formulation target due to localized thermal over-exposure during flash annealing.`,
          recommendation: `Compensate precursor ink formulation with +4.0 wt% excess ${secondary} or attenuate peak flash duration from 1.8 ms to 1.4 ms.`,
        },
        explanation: `Slight stoichiometry drift during high-speed printing: volatile component (${secondary}) concentration dropped by 3.5% due to transient thermal over-exposure. Precursor re-balancing advised.`,
      },
    ];
    return diagnosticOptions[Math.floor(Math.random() * diagnosticOptions.length)];
  } else {
    // Failure
    const diagnosticOptions: OutcomeDiagnosticResult[] = [
      {
        diagnostic: {
          anomaly: 'Substrate Delamination & Thermal Shock Macro-Cracking',
          evidence: `FE-SEM top-down and cross-sectional micrographs revealed complete longitudinal film peeling and extensive micro-crack networks throughout the ${symbols.join('-')} matrix.`,
          recommendation: `Preheat substrate to 220°C prior to aerosol deposition and introduce a 5 nm titanium adhesion buffer layer to mitigate thermal expansion mismatch.`,
        },
        explanation: `Thermal expansion mismatch induced macro-cracking: severe delamination between the ${symbols.join('-')} alloy film and substrate observed post-sintering under FE-SEM. Substrate preheating and adhesion buffer layer required.`,
      },
      {
        diagnostic: {
          anomaly: 'Severe Macroscopic Phase Immiscibility',
          evidence: `Backscattered electron SEM imaging and EDX elemental mapping confirmed complete phase segregation into discrete binary droplets with zero mutual solid solubility (ΔH_mix > +22 kJ/mol).`,
          recommendation: `Incompatible thermodynamic mixing pair (${primary} vs ${secondary}). Replace ${secondary} with an element exhibiting negative or near-zero mixing enthalpy with ${primary}.`,
        },
        explanation: `Extensive macroscopic phase separation: positive enthalpy of mixing (ΔH_mix > 22 kJ/mol) between ${primary} and ${secondary} prevented solid-solution formation, resulting in droplet divergence. Elemental substitution required.`,
      },
      {
        diagnostic: {
          anomaly: 'Aerosol Jet Precursor Agglomeration & Nozzle Clogging',
          evidence: `High-speed in-situ optical monitoring and SEM topography showed severe ink droplet pooling, non-uniform crater defects, and interrupted deposition tracks.`,
          recommendation: `Increase surfactant dispersant (PVP) concentration to 1.2 wt% and reduce precursor salt molarity by 25% to prevent colloidal agglomeration.`,
        },
        explanation: `Precursor agglomeration during aerosol atomization: nozzle clogging caused uneven droplet dispersion, leading to non-uniform island growth rather than continuous thin film. Ink re-dispersion protocol needed.`,
      },
      {
        diagnostic: {
          anomaly: 'Interfacial Oxidation & Metallic Bonding Suppression',
          evidence: `EDX spectroscopy confirmed severe oxygen contamination (>28 at% O) throughout the synthesized film, preventing metallic percolation and inter-particle sintering.`,
          recommendation: `Purge print chamber to < 5 ppm O₂ and verify seal integrity of the inert argon shroud envelope prior to laser initiation.`,
        },
        explanation: `Interfacial oxidation and degradation: trace atmospheric contamination triggered spontaneous metal oxide skin formation across nanoparticle surfaces, suppressing metallic bonding. Environmental seal check required.`,
      },
    ];
    return diagnosticOptions[Math.floor(Math.random() * diagnosticOptions.length)];
  }
}


