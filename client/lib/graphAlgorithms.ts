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
    nodes.forEach(n => adjList[n.id] = []);
    edges.forEach(e => adjList[e.source].push({ node: e.destination, weight: e.weight }));
    return adjList;
  }

  /** ✅ DIJKSTRA ALGORITHM */
  static dijkstra(nodes: GraphNode[], edges: GraphEdge[], sourceNode: string): AlgorithmResult {
    const adjList = this.buildAdjacencyList(nodes, edges);
    const steps: AlgorithmStep[] = [];
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();
    const shortestPathTree: GraphEdge[] = [];

    nodes.forEach(n => {
      distances[n.id] = n.id === sourceNode ? 0 : Infinity;
      previous[n.id] = null;
    });

    steps.push({
      type: 'initial',
      iteration: 0,
      distances: { ...distances },
      previous: { ...previous },
      message: `Initialize Dijkstra: ${sourceNode}=0, others=∞`
    });

    let iteration = 1;

    while (visited.size < nodes.length) {
      let minNode: string | null = null;
      let minDist = Infinity;

      for (const n of nodes) {
        if (!visited.has(n.id) && distances[n.id] < minDist) {
          minDist = distances[n.id];
          minNode = n.id;
        }
      }
      if (!minNode) break;

      visited.add(minNode);

      steps.push({
        type: 'select',
        iteration,
        currentNode: minNode,
        distances: { ...distances },
        previous: { ...previous },
        message: `Select ${minNode} with dist = ${minDist}`
      });

      for (const { node: neighbor, weight } of adjList[minNode]) {
        const newDist = distances[minNode] + weight;

        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
          previous[neighbor] = minNode;

          steps.push({
            type: 'relax',
            iteration,
            currentEdge: { source: minNode, destination: neighbor },
            distances: { ...distances },
            previous: { ...previous },
            updatedNodes: [neighbor],
            message: `Relax ${minNode}→${neighbor}, new dist=${newDist}`
          });
        }
      }
      iteration++;
    }

    nodes.forEach(n => {
      if (previous[n.id]) {
        const e = edges.find(e => e.source === previous[n.id] && e.destination === n.id);
        if (e) shortestPathTree.push(e);
      }
    });

    steps.push({
      type: 'complete',
      iteration,
      distances: { ...distances },
      previous: { ...previous },
      message: `Dijkstra complete`
    });

    return { distances, previous, steps, hasNegativeCycle: false, shortestPathTree };
  }

  /** ✅ BELLMAN-FORD ALGORITHM */
  static bellmanFord(nodes: GraphNode[], edges: GraphEdge[], sourceNode: string): AlgorithmResult {
    const steps: AlgorithmStep[] = [];
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const shortestPathTree: GraphEdge[] = [];

    nodes.forEach(n => {
      distances[n.id] = n.id === sourceNode ? 0 : Infinity;
      previous[n.id] = null;
    });

    steps.push({
      type: 'initial',
      iteration: 0,
      distances: { ...distances },
      previous: { ...previous },
      message: `Initialize Bellman-Ford: ${sourceNode}=0, others=∞`
    });

    // ✅ Relax edges |V|-1 times
    for (let i = 1; i <= nodes.length - 1; i++) {
      let relaxed = false;

      for (const { source, destination, weight } of edges) {

        if (distances[source] !== Infinity && distances[source] + weight < distances[destination]) {
          distances[destination] = distances[source] + weight;
          previous[destination] = source;
          relaxed = true;

          steps.push({
            type: 'relax',
            iteration: i,
            currentEdge: { source, destination },
            distances: { ...distances },
            previous: { ...previous },
            updatedNodes: [destination],
            message: `Iteration ${i}: Relax ${source}→${destination}`
          });
        }
      }

      if (!relaxed) {
        steps.push({
          type: 'update',
          iteration: i,
          distances: { ...distances },
          previous: { ...previous },
          message: `Iteration ${i}: No updates`
        });
        break;
      }
    }

    // ✅ Detect negative cycle
    for (const { source, destination, weight } of edges) {
      if (distances[source] + weight < distances[destination]) {
        steps.push({
          type: 'negative_cycle',
          iteration: nodes.length,
          currentEdge: { source, destination },
          distances: { ...distances },
          previous: { ...previous },
          message: `⚠️ Negative cycle detected at ${source}→${destination}`
        });

        return { distances, previous, steps, hasNegativeCycle: true, shortestPathTree: [] };
      }
    }

    nodes.forEach(n => {
      if (previous[n.id]) {
        const e = edges.find(e => e.source === previous[n.id] && e.destination === n.id);
        if (e) shortestPathTree.push(e);
      }
    });

    steps.push({
      type: 'complete',
      iteration: nodes.length,
      distances: { ...distances },
      previous: { ...previous },
      message: `Bellman-Ford complete — no negative cycle`
    });

    return { distances, previous, steps, hasNegativeCycle: false, shortestPathTree };
  }
}
