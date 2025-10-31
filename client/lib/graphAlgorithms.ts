export interface GraphEdge {
  source: string;
  destination: string;
  weight: number;
}

export interface GraphNode {
  id: string;
  x?: number;
  y?: number;
}

export interface AdjacencyList {
  [nodeId: string]: Array<{ node: string; weight: number }>;
}

export interface AlgorithmStep {
  type: 'initial' | 'select' | 'relax' | 'update' | 'complete' | 'negative_cycle';
  iteration: number;
  currentNode?: string;
  currentEdge?: { source: string; destination: string };
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  updatedNodes?: string[];
  message: string;
}

export interface AlgorithmResult {
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  steps: AlgorithmStep[];
  hasNegativeCycle: boolean;
  shortestPathTree: GraphEdge[];
}

export class GraphAlgorithms {
  static buildAdjacencyList(nodes: GraphNode[], edges: GraphEdge[]): AdjacencyList {
    const adjList: AdjacencyList = {};

    // Initialize all nodes
    for (const node of nodes) {
      if (!adjList[node.id]) {
        adjList[node.id] = [];
      }
    }

    // Add edges
    for (const edge of edges) {
      if (!adjList[edge.source]) {
        adjList[edge.source] = [];
      }
      adjList[edge.source].push({
        node: edge.destination,
        weight: edge.weight,
      });
    }

    return adjList;
  }

  static dijkstra(
    nodes: GraphNode[],
    edges: GraphEdge[],
    sourceNode: string
  ): AlgorithmResult {
    const adjList = this.buildAdjacencyList(nodes, edges);
    const steps: AlgorithmStep[] = [];
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();
    const shortestPathTree: GraphEdge[] = [];

    // Initialize
    for (const node of nodes) {
      distances[node.id] = node.id === sourceNode ? 0 : Infinity;
      previous[node.id] = null;
    }

    steps.push({
      type: 'initial',
      iteration: 0,
      distances: { ...distances },
      previous: { ...previous },
      message: `Initialize: Set distance to ${sourceNode} as 0, others as ∞`,
    });

    let iteration = 1;

    while (visited.size < nodes.length) {
      // Find unvisited node with minimum distance
      let minNode: string | null = null;
      let minDist = Infinity;

      for (const node of nodes) {
        if (!visited.has(node.id) && distances[node.id] < minDist) {
          minDist = distances[node.id];
          minNode = node.id;
        }
      }

      if (minNode === null || minDist === Infinity) {
        break;
      }

      visited.add(minNode);

      steps.push({
        type: 'select',
        iteration,
        currentNode: minNode,
        distances: { ...distances },
        previous: { ...previous },
        message: `Select node ${minNode} with distance ${minDist}`,
      });

      // Relax edges
      const neighbors = adjList[minNode] || [];
      const updatedNodes: string[] = [];

      for (const { node: neighbor, weight } of neighbors) {
        const newDist = distances[minNode] + weight;

        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
          previous[neighbor] = minNode;
          updatedNodes.push(neighbor);

          steps.push({
            type: 'relax',
            iteration,
            currentNode: minNode,
            currentEdge: { source: minNode, destination: neighbor },
            distances: { ...distances },
            previous: { ...previous },
            updatedNodes: [neighbor],
            message: `Relax edge ${minNode}→${neighbor}: update distance to ${newDist}`,
          });
        }
      }

      iteration++;
    }

    // Build shortest path tree
    for (const node of nodes) {
      if (previous[node.id] !== null && previous[node.id] !== undefined) {
        const edge = edges.find(
          (e) =>
            e.source === previous[node.id] &&
            e.destination === node.id
        );
        if (edge) {
          shortestPathTree.push(edge);
        }
      }
    }

    steps.push({
      type: 'complete',
      iteration,
      distances: { ...distances },
      previous: { ...previous },
      message: 'Algorithm complete',
    });

    return {
      distances,
      previous,
      steps,
      hasNegativeCycle: false,
      shortestPathTree,
    };
  }

  static bellmanFord(
    nodes: GraphNode[],
    edges: GraphEdge[],
    sourceNode: string
  ): AlgorithmResult {
    const steps: AlgorithmStep[] = [];
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const shortestPathTree: GraphEdge[] = [];

    // Initialize
    for (const node of nodes) {
      distances[node.id] = node.id === sourceNode ? 0 : Infinity;
      previous[node.id] = null;
    }

    steps.push({
      type: 'initial',
      iteration: 0,
      distances: { ...distances },
      previous: { ...previous },
      message: `Initialize: Set distance to ${sourceNode} as 0, others as ∞`,
    });

    let iteration = 1;

    // Relax edges n-1 times
    for (let i = 0; i < nodes.length - 1; i++) {
      let relaxed = false;

      for (const edge of edges) {
        const { source, destination, weight } = edge;

        if (distances[source] !== Infinity) {
          const newDist = distances[source] + weight;

          if (newDist < distances[destination]) {
            distances[destination] = newDist;
            previous[destination] = source;
            relaxed = true;

            steps.push({
              type: 'relax',
              iteration,
              currentEdge: { source, destination },
              distances: { ...distances },
              previous: { ...previous },
              updatedNodes: [destination],
              message: `Iteration ${i + 1}: Relax ${source}→${destination}, distance = ${newDist}`,
            });
          }
        }
      }

      if (!relaxed) {
        steps.push({
          type: 'update',
          iteration,
          distances: { ...distances },
          previous: { ...previous },
          message: `Iteration ${i + 1}: No updates`,
        });
      }

      iteration++;
    }

    // Check for negative cycle
    let hasNegativeCycle = false;
    for (const edge of edges) {
      const { source, destination, weight } = edge;

      if (distances[source] !== Infinity) {
        const newDist = distances[source] + weight;

        if (newDist < distances[destination]) {
          hasNegativeCycle = true;

          steps.push({
            type: 'negative_cycle',
            iteration,
            currentEdge: { source, destination },
            distances: { ...distances },
            previous: { ...previous },
            message: `⚠️ Negative weight cycle detected: ${source}→${destination}`,
          });

          break;
        }
      }
    }

    // Build shortest path tree
    for (const node of nodes) {
      if (previous[node.id] !== null && previous[node.id] !== undefined) {
        const edge = edges.find(
          (e) =>
            e.source === previous[node.id] &&
            e.destination === node.id
        );
        if (edge) {
          shortestPathTree.push(edge);
        }
      }
    }

    steps.push({
      type: 'complete',
      iteration,
      distances: { ...distances },
      previous: { ...previous },
      message: hasNegativeCycle
        ? 'Algorithm complete - Negative cycle detected'
        : 'Algorithm complete',
    });

    return {
      distances,
      previous,
      steps,
      hasNegativeCycle,
      shortestPathTree,
    };
  }
}
