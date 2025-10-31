import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GraphNode, GraphEdge } from '@/lib/graphAlgorithms';
import { Plus, Trash2 } from 'lucide-react';

interface InputPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onAddNode: (nodeId: string) => void;
  onAddEdge: (edge: GraphEdge) => void;
  onClear: () => void;
  onRemoveNode: (nodeId: string) => void;
  onRemoveEdge: (index: number) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  nodes,
  edges,
  onAddNode,
  onAddEdge,
  onClear,
  onRemoveNode,
  onRemoveEdge,
}) => {
  const [nodeInput, setNodeInput] = useState('');
  const [edgeInput, setEdgeInput] = useState('');

  const handleAddNode = () => {
    const nodeId = nodeInput.trim();
    if (nodeId && !nodes.some((n) => n.id === nodeId)) {
      onAddNode(nodeId);
      setNodeInput('');
    }
  };

  const handleAddEdge = () => {
    const parts = edgeInput.trim().split(/\s+/);
    if (parts.length === 3) {
      const [source, destination, weightStr] = parts;
      const weight = parseInt(weightStr, 10);

      if (
        !isNaN(weight) &&
        nodes.some((n) => n.id === source) &&
        nodes.some((n) => n.id === destination)
      ) {
        onAddEdge({ source, destination, weight });
        setEdgeInput('');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Node Input */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-900 uppercase">Add Node</h3>
        <div className="flex gap-1">
          <input
            type="text"
            value={nodeInput}
            onChange={(e) => setNodeInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddNode()}
            placeholder="e.g., A"
            className="flex-1 px-2 w-10 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleAddNode}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1"
            size="sm"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Edge Input */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-900 uppercase">Add Edge</h3>
        <div className="flex gap-1">
          <input
            type="text"
            value={edgeInput}
            onChange={(e) => setEdgeInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEdge()}
            placeholder="u v w"
            className="flex-1 px-2 w-10 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleAddEdge}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1"
            size="sm"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Nodes List */}
      {nodes.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-gray-700 uppercase">Nodes</h4>
          <div className="flex flex-wrap gap-1">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-xs"
              >
                {node.id}
                <button
                  onClick={() => onRemoveNode(node.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edges List */}
      {edges.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-gray-700 uppercase">Edges</h4>
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {edges.map((edge, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs bg-gray-100 px-2 py-1 rounded"
              >
                <span className="text-gray-700">
                  {edge.source} → {edge.destination} (w: {edge.weight})
                </span>
                <button
                  onClick={() => onRemoveEdge(idx)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Button */}
      {(nodes.length > 0 || edges.length > 0) && (
        <Button
          onClick={onClear}
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 border-red-200 text-xs h-8"
        >
          Clear All
        </Button>
      )}

      {/* Adjacency List Display */}
      {nodes.length > 0 && (
        <div className="bg-gray-50 p-2 rounded-md space-y-1">
          <h4 className="text-xs font-semibold text-gray-700 uppercase">Adj List</h4>
          <div className="text-xs text-gray-700 font-mono space-y-0.5 max-h-20 overflow-y-auto">
            {nodes.map((node) => {
              const adjacentEdges = edges.filter((e) => e.source === node.id);
              const adjList =
                adjacentEdges.length > 0
                  ? adjacentEdges
                      .map((e) => `${e.destination}(${e.weight})`)
                      .join(', ')
                  : '[]';
              return (
                <div key={node.id}>
                  {node.id}: [{adjList}]
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
