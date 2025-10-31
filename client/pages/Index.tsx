import React, { useState, useEffect, useRef } from 'react';
import { GraphCanvas } from '@/components/GraphCanvas';
import { InputPanel } from '@/components/InputPanel';
import { ControlPanel } from '@/components/ControlPanel';
import { DistanceTable } from '@/components/DistanceTable';
import { Button } from '@/components/ui/button';
import { HelpCircle, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import {
  GraphNode,
  GraphEdge,
  GraphAlgorithms,
  AlgorithmResult,
  AlgorithmStep,
} from '@/lib/graphAlgorithms';

export default function Index() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'dijkstra' | 'bellman-ford'>(
    'dijkstra'
  );
  const [sourceNode, setSourceNode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1.5);
  const [result, setResult] = useState<AlgorithmResult | undefined>();
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const animationIntervalRef = useRef<number>();

  // Handle node addition
  const handleAddNode = (nodeId: string) => {
    if (!nodes.some((n) => n.id === nodeId)) {
      setNodes([...nodes, { id: nodeId }]);
    }
  };

  // Handle edge addition
  const handleAddEdge = (edge: GraphEdge) => {
    if (
      !edges.some(
        (e) =>
          e.source === edge.source &&
          e.destination === edge.destination
      )
    ) {
      setEdges([...edges, edge]);
    }
  };

  // Handle node removal
  const handleRemoveNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
    setEdges(edges.filter((e) => e.source !== nodeId && e.destination !== nodeId));
  };

  // Handle edge removal
  const handleRemoveEdge = (index: number) => {
    setEdges(edges.filter((_, idx) => idx !== index));
  };

  // Handle clear all
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setSourceNode('');
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    setResult(undefined);
    setSteps([]);
  };

  // Handle algorithm run
  const handleRun = () => {
    if (!sourceNode || nodes.length === 0) return;

    let algorithmResult: AlgorithmResult;

    if (selectedAlgorithm === 'dijkstra') {
      algorithmResult = GraphAlgorithms.dijkstra(nodes, edges, sourceNode);
    } else {
      algorithmResult = GraphAlgorithms.bellmanFord(nodes, edges, sourceNode);
    }

    setResult(algorithmResult);
    setSteps(algorithmResult.steps);
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStep(0);
  };

  // Handle pause
  const handlePause = () => {
    setIsPaused(true);
  };

  // Handle resume
  const handleResume = () => {
    setIsPaused(false);
  };

  // Handle reset
  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    setResult(undefined);
    setSteps([]);
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Auto-advance animation (unless in manual mode)
  useEffect(() => {
    if (!isRunning || isPaused || steps.length === 0 || manualMode) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          setIsRunning(false);
          return prev;
        }
      });
    }, 1000 / animationSpeed);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, steps, animationSpeed, manualMode]);

  const currentStepData = steps[currentStep];
  const highlightedEdge = currentStepData?.currentEdge;
  const highlightedNode = currentStepData?.currentNode;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Graph Shortest Path Visualizer</h1>
            <p className="text-gray-600 text-xs">Dijkstra & Bellman-Ford Algorithm Visualization</p>
          </div>
          <Button
            onClick={() => setShowInstructions(!showInstructions)}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <HelpCircle className="w-3 h-3" />
            Help
          </Button>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md max-h-96 overflow-y-auto p-4">
            <h3 className="font-semibold text-sm mb-2">How to Use:</h3>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Add nodes (e.g., A, B, C)</li>
              <li>Add edges: "source dest weight" (e.g., A B 5)</li>
              <li>Select algorithm and source node</li>
              <li>Click "Start" to visualize</li>
              <li>Use Manual mode for step-by-step control</li>
              <li>Blue edges = shortest path tree</li>
            </ol>
            <Button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-3"
              size="sm"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex-1 overflow-hidden flex gap-2 p-2">
        {/* Left Sidebar - Collapsible */}
        {!sidebarCollapsed && (
          <div className="w-48 bg-white rounded-lg shadow-sm p-2.5 overflow-y-auto flex flex-col flex-shrink-0 relative">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-900 uppercase">Setup</h2>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="text-gray-600 hover:text-gray-900 p-0.5"
                title="Collapse"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mb-2 text-xs">
              <InputPanel
                nodes={nodes}
                edges={edges}
                onAddNode={handleAddNode}
                onAddEdge={handleAddEdge}
                onClear={handleClear}
                onRemoveNode={handleRemoveNode}
                onRemoveEdge={handleRemoveEdge}
              />
            </div>
            <hr className="my-1.5" />
            <h2 className="text-xs font-semibold text-gray-900 uppercase mb-2">Run</h2>
            <div className="text-xs">
              <ControlPanel
                nodes={nodes}
                selectedAlgorithm={selectedAlgorithm}
                sourceNode={sourceNode}
                isRunning={isRunning}
                isPaused={isPaused}
                currentStep={currentStep}
                totalSteps={steps.length}
                animationSpeed={animationSpeed}
                result={result}
                manualMode={manualMode}
                onAlgorithmChange={setSelectedAlgorithm}
                onSourceNodeChange={setSourceNode}
                onRun={handleRun}
                onPause={handlePause}
                onResume={handleResume}
                onReset={handleReset}
                onSpeedChange={setAnimationSpeed}
                onPreviousStep={handlePreviousStep}
                onNextStep={handleNextStep}
                onManualModeChange={setManualMode}
              />
            </div>
          </div>
        )}

        {/* Sidebar Toggle Button */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="w-8 bg-white rounded-lg shadow-sm p-1 flex items-center justify-center text-gray-600 hover:text-gray-900 flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Center Area - Graph and Step Info */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 relative">
          {/* Start Button - Always Accessible */}
          {!isRunning && nodes.length > 0 && sourceNode && (
            <div className="absolute top-2 right-2 z-50">
              <Button
                onClick={handleRun}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold text-base h-14 px-6 shadow-lg"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start
              </Button>
            </div>
          )}

          {/* Step Info Bar */}
          {steps.length > 0 && currentStepData && (
            <div className={`bg-white rounded-lg shadow-sm p-2 border-l-4 flex-shrink-0 ${
              currentStepData.type === 'negative_cycle'
                ? 'border-red-400'
                : 'border-blue-400'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-xs">
                  Step {currentStep + 1}/{steps.length}
                </h3>
                <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">
                  {currentStepData.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-800 mb-1">{currentStepData.message}</p>
              <div className="w-full bg-gray-300 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Graph Canvas */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-3 overflow-hidden min-h-0">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              highlightedEdge={highlightedEdge}
              highlightedNode={highlightedNode}
              shortestPathTree={result?.shortestPathTree}
            />
          </div>
        </div>

        {/* Right Panel - Distance Table and Controls (Only when running) */}
        {isRunning && steps.length > 0 && (
          <div className="w-60 bg-white rounded-lg shadow-sm p-2.5 flex flex-col flex-shrink-0 overflow-hidden">
            <h3 className="text-xs font-semibold text-gray-900 uppercase mb-2">Distance Table</h3>
            <div className="flex-1 overflow-y-auto mb-2">
              <DistanceTable
                nodes={nodes}
                currentStep={currentStepData}
                result={result}
              />
            </div>

            {/* Controls Below Distance Table */}
            <div className="border-t border-gray-200 pt-2 space-y-2">
              {/* Mode Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900 uppercase">Mode</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setManualMode(false)}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-colors ${
                      !manualMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setManualMode(true)}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-colors ${
                      manualMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {/* Play/Pause/Stop Controls */}
              <div className="flex gap-1">
                {isPaused ? (
                  <Button
                    onClick={handleResume}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9"
                    size="sm"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    onClick={handlePause}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-xs h-9"
                    size="sm"
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </Button>
                )}

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 text-xs font-semibold h-9"
                  size="sm"
                >
                  Stop
                </Button>
              </div>

              {/* Step Navigation (Manual mode) */}
              {manualMode && (
                <div className="flex gap-1">
                  <Button
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    size="sm"
                    className="flex-1 font-semibold text-xs h-8"
                  >
                    ◀
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={currentStep === steps.length - 1}
                    variant="outline"
                    size="sm"
                    className="flex-1 font-semibold text-xs h-8"
                  >
                    ▶
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
