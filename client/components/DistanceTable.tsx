import React from 'react';
import { GraphNode, AlgorithmStep } from '@/lib/graphAlgorithms';

interface DistanceTableProps {
  nodes: GraphNode[];
  currentStep?: AlgorithmStep;
  result?: any;
}

export const DistanceTable: React.FC<DistanceTableProps> = ({
  nodes,
  currentStep,
  result,
}) => {
  if (!currentStep) {
    return (
      <div className="text-center text-xs text-gray-500 py-4">
        Start visualization
      </div>
    );
  }

  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="space-y-1 h-full flex flex-col">
      {/* Distance Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-blue-600 text-white">
              <th className="border border-blue-500 px-1.5 py-0.5 text-left font-semibold">
                N
              </th>
              <th className="border border-blue-500 px-1.5 py-0.5 text-left font-semibold">
                Dist
              </th>
              <th className="border border-blue-500 px-1.5 py-0.5 text-left font-semibold">
                Prev
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedNodes.map((node) => {
              const distance = currentStep.distances[node.id];
              const previous = currentStep.previous[node.id];
              const isUpdated = currentStep.updatedNodes?.includes(node.id);

              return (
                <tr
                  key={node.id}
                  className={`border border-gray-200 ${
                    isUpdated ? 'bg-yellow-100' : 'bg-white'
                  } hover:bg-gray-100`}
                >
                  <td className="border border-gray-200 px-1.5 py-0.5 font-bold text-gray-900">
                    {node.id}
                  </td>
                  <td className="border border-gray-200 px-1.5 py-0.5 text-gray-700 font-semibold">
                    {distance === Infinity ? '∞' : distance}
                  </td>
                  <td className="border border-gray-200 px-1.5 py-0.5 text-gray-700 text-center">
                    {previous === null ? '-' : previous}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Final Result Summary */}
      {currentStep.type === 'complete' && result && (
        <div className="bg-green-50 border-t border-green-200 pt-1 mt-1 text-xs">
          <p className="font-semibold text-green-800 mb-1 text-center">✓ Done</p>
        </div>
      )}
    </div>
  );
};
