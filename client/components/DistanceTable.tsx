import React from 'react';
import { GraphNode, AlgorithmStep } from '@/lib/graphAlgorithms';

interface DistanceTableProps {
  nodes: GraphNode[];
  currentStep?: AlgorithmStep;
  result?: any;
  algorithm: 'dijkstra' | 'bellman-ford';
}

// Algorithm pseudocode with line identifiers
const ALGORITHM_CODE = {
  'dijkstra': [
    { id: "init", code: "function Dijkstra(graph, start):" },
    { id: "init", code: "  for each vertex v in graph:" },
    { id: "init", code: "    dist[v] = ∞" },
    { id: "init", code: "    prev[v] = null" },
    { id: "init", code: "  dist[start] = 0" },
    { id: "init", code: "  unvisited = all nodes" },
    { id: "loop", code: "  while unvisited is not empty:" },
    { id: "select", code: "    current = node with minimum distance" },
    { id: "visit", code: "    remove current from unvisited" },
    { id: "neighbors", code: "    for each neighbor n of current:" },
    { id: "relax", code: "      newDist = dist[current] + weight(current, n)" },
    { id: "update", code: "      if newDist < dist[n]:" },
    { id: "update", code: "        dist[n] = newDist" },
    { id: "update", code: "        prev[n] = current" },
    { id: "complete", code: "  return dist, prev" },
  ],

  'bellman-ford': [
    { id: "init", code: "function BellmanFord(graph, start):" },
    { id: "init", code: "  for each vertex v in graph:" },
    { id: "init", code: "    dist[v] = ∞" },
    { id: "init", code: "    prev[v] = null" },
    { id: "init", code: "  dist[start] = 0" },
    { id: "loop", code: "  repeat |V| - 1 times:" },
    { id: "edges", code: "    for each edge (u → v) with weight w:" },
    { id: "relax", code: "      if dist[u] + w < dist[v]:" },
    { id: "update", code: "        dist[v] = dist[u] + w" },
    { id: "update", code: "        prev[v] = u" },
    { id: "check", code: "  for each edge (u → v) with weight w:" },
    { id: "check", code: "    if dist[u] + w < dist[v]:" },
    { id: "check", code: "      error 'Negative cycle detected'" },
    { id: "complete", code: "  return dist, prev" },
  ],
};

export const DistanceTable: React.FC<DistanceTableProps> = ({
  nodes,
  currentStep,
  result,
  algorithm,
}) => {
  if (!currentStep) {
    return (
      <div className="text-center text-xs text-gray-500 py-4">
        Start visualization
      </div>
    );
  }

  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const codeLines = ALGORITHM_CODE[algorithm] || ALGORITHM_CODE.dijkstra;

  const getHighlightedLineId = () => {
    switch (currentStep.type) {
      case 'initial': return 'init';
      case 'select': return 'select';
      case 'relax': return 'relax';
      case 'update': return 'update';
      case 'complete': return 'complete';
      case 'negative_cycle': return 'check';
      default: return 'loop';
    }
  };

  const highlightedLineId = getHighlightedLineId();

  return (
    <div className="flex gap-2 h-full">
      
      {/* Algorithm Code Panel (60% width fixed) */}
      <div className="flex flex-col border border-gray-300 rounded bg-gray-50 basis-[60%] min-w-0">
        <div className="bg-purple-600 text-white px-2 py-1 text-xs font-semibold">
          Algorithm Code
        </div>

        <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
          {codeLines.map((line, idx) => (
            <div
              key={idx}
              className={`px-2 py-0.5 rounded ${
                line.id === highlightedLineId
                  ? "bg-yellow-200 border-l-2 border-yellow-600 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {line.code}
            </div>
          ))}
        </div>

        <div className="border-t bg-white px-2 py-1.5 text-xs">
          <span className="font-semibold text-purple-700">Step:</span>{" "}
          {currentStep.message || 'Processing...'}
        </div>
      </div>

      {/* Distance Table Panel (40% width fixed) */}
      <div className="flex flex-col border border-gray-300 rounded bg-gray-50 basis-[40%] min-w-0">
        <div className="bg-blue-600 text-white px-2 py-1 text-xs font-semibold">
          Distance Table
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-blue-100">
              <tr>
                <th className="border border-gray-300 px-1.5 py-0.5 text-left">N</th>
                <th className="border border-gray-300 px-1.5 py-0.5 text-left">Dist</th>
                <th className="border border-gray-300 px-1.5 py-0.5 text-left">Prev</th>
              </tr>
            </thead>
            <tbody>
              {sortedNodes.map((node) => {
                const distance = currentStep.distances[node.id];
                const previous = currentStep.previous[node.id];
                const isUpdated = currentStep.updatedNodes?.includes(node.id);
                const isCurrent = currentStep.currentNode === node.id;

                return (
                  <tr
                    key={node.id}
                    className={`border ${
                      isCurrent ? "bg-blue-100 border-blue-400"
                      : isUpdated ? "bg-yellow-100"
                      : "bg-white"
                    } hover:bg-gray-100`}
                  >
                    <td className="border px-1.5 py-0.5 font-bold text-gray-900">
                      {node.id}{isCurrent && <span className="ml-1 text-blue-600">←</span>}
                    </td>
                    <td className="border px-1.5 py-0.5 font-semibold text-gray-700">
                      {distance === Infinity ? '∞' : distance}
                    </td>
                    <td className="border px-1.5 py-0.5 text-center text-gray-700">
                      {previous === null ? '-' : previous}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {currentStep.type === 'complete' && result && (
          <div className="bg-green-50 border-t px-2 py-1.5 text-xs text-center text-green-800 font-semibold">
            ✓ Algorithm Complete
          </div>
        )}
      </div>
    </div>
  );
};
