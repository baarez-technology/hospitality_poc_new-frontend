import { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, Percent, DollarSign, Users, AlertCircle, Sparkles, BarChart3 } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../ui2/Modal';
import { Button } from '../ui2/Button';
import { revenueIntelligenceService, ScenarioRequest, ScenarioResponse } from '../../api/services/revenue-intelligence.service';

interface ScenarioSimulationModalProps {
  open: boolean;
  onClose: () => void;
}

type ScenarioType = 'rate_increase' | 'rate_decrease' | 'promotion';

interface ScenarioConfig {
  type: ScenarioType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  paramLabel: string;
  paramUnit: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    type: 'rate_increase',
    label: 'Rate Increase',
    description: 'Simulate the impact of increasing room rates',
    icon: TrendingUp,
    color: 'text-sage-600',
    bgColor: 'bg-sage-50',
    borderColor: 'border-sage-200',
    paramLabel: 'Rate Increase',
    paramUnit: '%',
    defaultValue: 10,
    min: 1,
    max: 50,
    step: 1,
  },
  {
    type: 'rate_decrease',
    label: 'Rate Decrease',
    description: 'Simulate the impact of reducing room rates',
    icon: TrendingDown,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    paramLabel: 'Rate Decrease',
    paramUnit: '%',
    defaultValue: 10,
    min: 1,
    max: 50,
    step: 1,
  },
  {
    type: 'promotion',
    label: 'Promotion',
    description: 'Simulate a promotional discount campaign',
    icon: Percent,
    color: 'text-gold-600',
    bgColor: 'bg-gold-50',
    borderColor: 'border-gold-200',
    paramLabel: 'Discount',
    paramUnit: '%',
    defaultValue: 15,
    min: 5,
    max: 40,
    step: 5,
  },
];

export default function ScenarioSimulationModal({ open, onClose }: ScenarioSimulationModalProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('rate_increase');
  const [paramValue, setParamValue] = useState(10);
  const [demandLift, setDemandLift] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScenarioResponse | null>(null);

  const currentConfig = SCENARIOS.find(s => s.type === selectedScenario)!;

  const handleScenarioChange = (type: ScenarioType) => {
    setSelectedScenario(type);
    const config = SCENARIOS.find(s => s.type === type)!;
    setParamValue(config.defaultValue);
    setResult(null);
    setError(null);
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: ScenarioRequest = {
        scenario_type: selectedScenario,
        parameters: {},
      };

      // Set the appropriate parameter based on scenario type
      if (selectedScenario === 'rate_increase') {
        request.parameters.percentage = paramValue;
      } else if (selectedScenario === 'rate_decrease') {
        request.parameters.percentage = -paramValue;
      } else if (selectedScenario === 'promotion') {
        request.parameters.discount = paramValue;
        request.parameters.demand_lift = demandLift;
      }

      const response = await revenueIntelligenceService.simulateScenario(request);
      setResult(response);
    } catch (err) {
      console.error('Scenario simulation failed:', err);
      // Use mock result for demo purposes
      const mockResult: ScenarioResponse = {
        scenario_type: selectedScenario,
        parameters: { percentage: paramValue },
        baseline: {
          revenue: 1250000,
          occupancy: 78,
          adr: 8500,
        },
        projected: {
          revenue: selectedScenario === 'rate_increase'
            ? 1250000 * (1 + (paramValue * 0.008))
            : selectedScenario === 'rate_decrease'
            ? 1250000 * (1 + (paramValue * 0.012))
            : 1250000 * (1 + (paramValue * 0.015)),
          revenue_change: selectedScenario === 'rate_increase'
            ? 1250000 * (paramValue * 0.008)
            : selectedScenario === 'rate_decrease'
            ? 1250000 * (paramValue * 0.012)
            : 1250000 * (paramValue * 0.015),
          revenue_change_percent: selectedScenario === 'rate_increase'
            ? paramValue * 0.8
            : selectedScenario === 'rate_decrease'
            ? paramValue * 1.2
            : paramValue * 1.5,
        },
        recommendation: selectedScenario === 'rate_increase'
          ? `A ${paramValue}% rate increase could yield positive results. Monitor competitor pricing closely.`
          : selectedScenario === 'rate_decrease'
          ? `A ${paramValue}% rate decrease may increase bookings but watch margins carefully.`
          : `A ${paramValue}% promotional discount could drive significant booking volume.`,
        confidence: 85,
        simulated_at: new Date().toISOString(),
      };
      setResult(mockResult);
      setError('Using simulated data - API temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setSelectedScenario('rate_increase');
    setParamValue(10);
    setDemandLift(0);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      <ModalHeader icon={Calculator}>
        <ModalTitle>Scenario Simulation</ModalTitle>
        <ModalDescription>
          Run what-if analysis to predict revenue impact of pricing changes
        </ModalDescription>
      </ModalHeader>

      <ModalContent className="space-y-6">
        {/* Scenario Type Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Select Scenario Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {SCENARIOS.map((scenario) => {
              const Icon = scenario.icon;
              const isSelected = selectedScenario === scenario.type;
              return (
                <button
                  key={scenario.type}
                  onClick={() => handleScenarioChange(scenario.type)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `${scenario.bgColor} ${scenario.borderColor}`
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${scenario.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${scenario.color}`} />
                  </div>
                  <p className={`font-semibold text-sm ${isSelected ? scenario.color : 'text-neutral-900'}`}>
                    {scenario.label}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">{scenario.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameter Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {currentConfig.paramLabel}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={currentConfig.min}
                max={currentConfig.max}
                step={currentConfig.step}
                value={paramValue}
                onChange={(e) => setParamValue(Number(e.target.value))}
                className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-terra-500"
              />
              <div className="flex items-center gap-1 px-4 py-2 bg-neutral-100 rounded-lg min-w-[80px] justify-center">
                <span className="text-lg font-bold text-neutral-900">{paramValue}</span>
                <span className="text-sm text-neutral-500">{currentConfig.paramUnit}</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>{currentConfig.min}{currentConfig.paramUnit}</span>
              <span>{currentConfig.max}{currentConfig.paramUnit}</span>
            </div>
          </div>

          {selectedScenario === 'promotion' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Expected Demand Lift (optional)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={demandLift}
                  onChange={(e) => setDemandLift(Number(e.target.value))}
                  className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
                <div className="flex items-center gap-1 px-4 py-2 bg-neutral-100 rounded-lg min-w-[80px] justify-center">
                  <span className="text-lg font-bold text-neutral-900">{demandLift}</span>
                  <span className="text-sm text-neutral-500">%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-terra-500" />
              <h4 className="font-semibold text-neutral-900">Simulation Results</h4>
              <span className="ml-auto text-xs text-neutral-500">
                Confidence: {result.confidence}%
              </span>
            </div>

            {/* Metrics Comparison */}
            <div className="grid grid-cols-3 gap-4">
              {/* Baseline */}
              <div className="p-4 bg-neutral-50 rounded-xl">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Baseline</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">Revenue</span>
                    <span className="text-sm font-semibold text-neutral-900">
                      ₹{(result.baseline.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">Occupancy</span>
                    <span className="text-sm font-semibold text-neutral-900">{result.baseline.occupancy}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">ADR</span>
                    <span className="text-sm font-semibold text-neutral-900">
                      ₹{result.baseline.adr.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-terra-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-terra-600" />
                </div>
              </div>

              {/* Projected */}
              <div className={`p-4 rounded-xl ${result.projected.revenue_change >= 0 ? 'bg-sage-50' : 'bg-rose-50'}`}>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Projected</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">Revenue</span>
                    <span className={`text-sm font-semibold ${result.projected.revenue_change >= 0 ? 'text-sage-700' : 'text-rose-700'}`}>
                      ₹{(result.projected.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">Change</span>
                    <span className={`text-sm font-bold ${result.projected.revenue_change >= 0 ? 'text-sage-700' : 'text-rose-700'}`}>
                      {result.projected.revenue_change >= 0 ? '+' : ''}
                      ₹{(result.projected.revenue_change / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">% Change</span>
                    <span className={`text-sm font-bold ${result.projected.revenue_change_percent >= 0 ? 'text-sage-700' : 'text-rose-700'}`}>
                      {result.projected.revenue_change_percent >= 0 ? '+' : ''}
                      {result.projected.revenue_change_percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="p-4 bg-ocean-50 rounded-xl border border-ocean-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-ocean-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-ocean-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ocean-700 uppercase tracking-wider mb-1">
                    AI Recommendation
                  </p>
                  <p className="text-sm text-ocean-900">{result.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}
      </ModalContent>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          icon={Calculator}
          onClick={handleSimulate}
          loading={loading}
          disabled={loading}
        >
          {result ? 'Re-Simulate' : 'Run Simulation'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
