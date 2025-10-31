import React from 'react';
import { Button } from '@/components/ui/button';
import { GraphNode, AlgorithmResult } from '@/lib/graphAlgorithms';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface ControlPanelProps {
  nodes: GraphNode[];
  selectedAlgorithm: 'dijkstra' | 'bellman-ford';
  sourceNode: string;
  isRunning: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  animationSpeed: number;
  result?: AlgorithmResult;
  manualMode: boolean;
  onAlgorithmChange: (algo: 'dijkstra' | 'bellman-ford') => void;
  onSourceNodeChange: (node: string) => void;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onManualModeChange: (mode: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  nodes,
  selectedAlgorithm,
  sourceNode,
  isRunning,
  isPaused,
  currentStep,
  totalSteps,
  animationSpeed,
  result,
  manualMode,
  onAlgorithmChange,
  onSourceNodeChange,
  onRun,
  onPause,
  onResume,
  onReset,
  onSpeedChange,
  onPreviousStep,
  onNextStep,
  onManualModeChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Algorithm Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900 uppercase">Algorithm</label>
        <div className="flex gap-2">
          <button
            onClick={() => onAlgorithmChange('dijkstra')}
            className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors ${
              selectedAlgorithm === 'dijkstra'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={isRunning}
          >
            Dijkstra
          </button>
          <button
            onClick={() => onAlgorithmChange('bellman-ford')}
            className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors ${
              selectedAlgorithm === 'bellman-ford'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={isRunning}
          >
            B-Ford
          </button>
        </div>
      </div>

      {/* Source Node Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900 uppercase">Source</label>
        <select
          value={sourceNode}
          onChange={(e) => onSourceNodeChange(e.target.value)}
          disabled={isRunning || nodes.length === 0}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select source node</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.id}
            </option>
          ))}
        </select>
      </div>


      {/* Step Navigation */}
      {isRunning && totalSteps > 0 && (
        <div className="space-y-3 bg-blue-50 p-3 rounded border border-blue-200">
          <div className="text-sm font-semibold text-blue-900 text-center">
            Step {currentStep + 1} / {totalSteps}
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%`,
              }}
            ></div>
          </div>

          {manualMode && (
            <div className="flex gap-2">
              <Button
                onClick={onPreviousStep}
                disabled={currentStep === 0}
                variant="outline"
                size="sm"
                className="flex-1 font-semibold text-sm h-10"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                onClick={onNextStep}
                disabled={currentStep === totalSteps - 1}
                variant="outline"
                size="sm"
                className="flex-1 font-semibold text-sm h-10"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Animation Speed */}
      {isRunning && !manualMode && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-900 uppercase">Speed</label>
            <span className="text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded">
              {animationSpeed.toFixed(1)}x
            </span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-600">
            <span className="text-lg">🐢</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="flex-1 h-2"
            />
            <span className="text-lg">🚀</span>
          </div>
        </div>
      )}

      {/* Negative Cycle Warning */}
      {result?.hasNegativeCycle && (
        <div className="bg-red-50 border border-red-300 p-3 rounded-md">
          <p className="text-sm font-semibold text-red-800">
            ⚠️ Negative Cycle Detected
          </p>
          <p className="text-sm text-red-700 mt-1">
            Undefined shortest paths
          </p>
        </div>
      )}
    </div>
  );
};
