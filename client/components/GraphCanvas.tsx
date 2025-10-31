import React, { useEffect, useRef } from 'react';
import { GraphNode, GraphEdge } from '@/lib/graphAlgorithms';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightedEdge?: { source: string; destination: string };
  highlightedNode?: string;
  shortestPathTree?: GraphEdge[];
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  highlightedEdge,
  highlightedNode,
  shortestPathTree = [],
}) => {
  const canvasRef = useRef<SVGSVGElement>(null);

  const nodeRadius = 25;
  const arrowSize = 15;

  // Generate node positions if not already set
  const positionedNodes = React.useMemo(() => {
    const width = 600;
    const height = 400;

    return nodes.map((node, index) => {
      if (node.x !== undefined && node.y !== undefined) {
        return node;
      }

      // Arrange in circle if positions not set
      const angle = (index / nodes.length) * 2 * Math.PI;
      const x = width / 2 + Math.cos(angle) * 150;
      const y = height / 2 + Math.sin(angle) * 150;

      return { ...node, x, y };
    });
  }, [nodes]);

  const renderEdge = (
    source: GraphNode,
    dest: GraphNode,
    weight: number,
    isHighlighted: boolean,
    isInShortestPath: boolean
  ) => {
    if (source.x === undefined || source.y === undefined || dest.x === undefined || dest.y === undefined) {
      return null;
    }

    // Calculate edge direction and endpoints
    const dx = dest.x - source.x;
    const dy = dest.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Shorten edge to not overlap with node circles
    const startX = source.x + Math.cos(angle) * nodeRadius;
    const startY = source.y + Math.sin(angle) * nodeRadius;
    const endX = dest.x - Math.cos(angle) * nodeRadius;
    const endY = dest.y - Math.sin(angle) * nodeRadius;

    // Arrow points
    const arrowX = endX;
    const arrowY = endY;
    const arrowAngle = angle;

    const arrowPoints = [
      [arrowX, arrowY],
      [
        arrowX - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
        arrowY - arrowSize * Math.sin(arrowAngle - Math.PI / 6),
      ],
      [
        arrowX - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
        arrowY - arrowSize * Math.sin(arrowAngle + Math.PI / 6),
      ],
    ];

    // Label position
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const labelOffsetX = -Math.sin(angle) * 20;
    const labelOffsetY = Math.cos(angle) * 20;

    const strokeColor = isHighlighted
      ? '#ef4444'
      : isInShortestPath
        ? '#3b82f6'
        : '#d1d5db';
    const strokeWidth = isHighlighted || isInShortestPath ? 3 : 2;

    return (
      <g key={`${source.id}-${dest.id}`}>
        {/* Edge line */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          markerEnd={`url(#arrowhead-${isHighlighted ? 'red' : isInShortestPath ? 'blue' : 'gray'})`}
        />

        {/* Weight label */}
        <text
          x={midX + labelOffsetX}
          y={midY + labelOffsetY}
          textAnchor="middle"
          fontSize="14"
          fill="#666"
          fontWeight="600"
          className="pointer-events-none"
        >
          {weight}
        </text>
      </g>
    );
  };

  const renderNode = (node: GraphNode, isHighlighted: boolean) => {
    if (node.x === undefined || node.y === undefined) return null;

    const bgColor = isHighlighted ? '#ef4444' : '#3b82f6';
    const textColor = '#fff';

    return (
      <g key={node.id}>
        {/* Node circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r={nodeRadius}
          fill={bgColor}
          stroke="#fff"
          strokeWidth="2"
          className="transition-all"
        />

        {/* Node label */}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="bold"
          fill={textColor}
          className="pointer-events-none"
        >
          {node.id}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
        className="border border-gray-200 rounded bg-gray-50"
      >
        <defs>
          {/* Arrow markers */}
          <marker
            id="arrowhead-gray"
            markerWidth="10"
            markerHeight="10"
            refX={arrowSize}
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#d1d5db" />
          </marker>
          <marker
            id="arrowhead-red"
            markerWidth="10"
            markerHeight="10"
            refX={arrowSize}
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
          </marker>
          <marker
            id="arrowhead-blue"
            markerWidth="10"
            markerHeight="10"
            refX={arrowSize}
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge) => {
          const sourceNode = positionedNodes.find((n) => n.id === edge.source);
          const destNode = positionedNodes.find((n) => n.id === edge.destination);

          if (!sourceNode || !destNode) return null;

          const isHighlighted =
            highlightedEdge?.source === edge.source &&
            highlightedEdge?.destination === edge.destination;

          const isInShortestPath = shortestPathTree.some(
            (e) =>
              e.source === edge.source &&
              e.destination === edge.destination
          );

          return renderEdge(sourceNode, destNode, edge.weight, isHighlighted, isInShortestPath);
        })}

        {/* Nodes */}
        {positionedNodes.map((node) => {
          const isHighlighted = highlightedNode === node.id;
          return renderNode(node, isHighlighted);
        })}
      </svg>
    </div>
  );
};
