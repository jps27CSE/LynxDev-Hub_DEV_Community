import type { DsaModule } from "../types";

export const graphsModule: DsaModule = {
  slug: "graphs",
  order: 15,
  part: 3,
  partTitle: "Advanced",
  title: "Graphs",
  description: "BFS, DFS, topological sort, shortest paths, MST, union-find.",
  kind: "lesson",
  story:
    "Graphs model relationships: networks, dependencies, routes. Most 'hard' problems are graph problems in disguise.",
  chapters: [
    {
      slug: "representation",
      title: "Representation",
      lessonSlug: "representation",
    },
    { slug: "traversals", title: "BFS & DFS", lessonSlug: "traversals" },
    {
      slug: "shortest-paths",
      title: "Shortest paths",
      lessonSlug: "shortest-paths",
    },
    {
      slug: "mst-uf",
      title: "MST & union-find",
      lessonSlug: "mst-and-union-find",
    },
  ],
  lessons: [
    {
      slug: "representation",
      title: "Graph representation",
      sections: [
        {
          kind: "concept",
          title: "Adjacency list vs matrix",
          body: "Adjacency list: O(V+E) space, O(degree) neighbour lookup. Adjacency matrix: O(V²) space, O(1) edge check. Use list for sparse graphs (most real graphs), matrix for dense or when O(1) edge check matters.",
        },
        {
          kind: "visual",
          title: "A graph",
          frames: [
            {
              id: "f1",
              kind: "graph",
              caption: "Graph: 1-2, 2-3, 1-3. Undirected.",
              state: {
                kind: "graph",
                nodes: [
                  { id: "1", label: "1" },
                  { id: "2", label: "2" },
                  { id: "3", label: "3" },
                ],
                edges: [
                  { from: "1", to: "2" },
                  { from: "2", to: "3" },
                  { from: "1", to: "3" },
                ],
              },
            },
          ],
        },
        {
          kind: "recap",
          points: [
            "List: O(V+E) space, sparse graphs.",
            "Matrix: O(V²) space, dense graphs.",
          ],
        },
      ],
      sources: [
        { label: "Graph (VisuAlgo)", url: "https://visualgo.net/en/graphds" },
      ],
      attribution: "Synthesis of Striver's A2Z graphs section.",
    },
    {
      slug: "traversals",
      title: "BFS & DFS",
      sections: [
        {
          kind: "concept",
          title: "BFS",
          body: "Explore level by level using a queue. Finds shortest path in unweighted graphs. O(V+E) time and space.",
        },
        {
          kind: "concept",
          title: "DFS",
          body: "Explore as deep as possible, then backtrack (recursion or stack). Used for connected components, cycle detection, topological sort. O(V+E).",
        },
        {
          kind: "code",
          title: "BFS",
          language: "javascript",
          starter:
            "function bfs(adj, start) {\n  const visited = new Set([start]);\n  const queue = [start];\n  const order = [];\n  while (queue.length) {\n    const u = queue.shift();\n    order.push(u);\n    for (const v of adj[u]) if (!visited.has(v)) { visited.add(v); queue.push(v); }\n  }\n  return order;\n}\n\nconsole.log(bfs({ 1: [2, 3], 2: [4], 3: [], 4: [] }, 1));",
          solution:
            "function bfs(adj, start) {\n  const visited = new Set([start]);\n  const queue = [start];\n  const order = [];\n  while (queue.length) {\n    const u = queue.shift();\n    order.push(u);\n    for (const v of adj[u]) if (!visited.has(v)) { visited.add(v); queue.push(v); }\n  }\n  return order;\n}\n\nconsole.log(bfs({ 1: [2, 3], 2: [4], 3: [], 4: [] }, 1));",
          tests: [{ input: "bfs({1:[2],2:[]},1)", expected: "[1,2]" }],
        },
        {
          kind: "recap",
          points: [
            "BFS: queue, level order, shortest path (unweighted).",
            "DFS: recursion/stack, components, cycles.",
            "Both O(V+E).",
          ],
        },
      ],
      sources: [
        { label: "BFS/DFS (VisuAlgo)", url: "https://visualgo.net/en/dfsbfs" },
      ],
      attribution: "Synthesis of Striver's A2Z graphs section.",
    },
    {
      slug: "shortest-paths",
      title: "Shortest paths",
      sections: [
        {
          kind: "concept",
          title: "Dijkstra",
          body: "Greedy: always expand the unvisited node with smallest distance. Requires non-negative weights. O((V+E) log V) with a min-heap.",
        },
        {
          kind: "concept",
          title: "Bellman-Ford & Floyd-Warshall",
          body: "Bellman-Ford handles negative edges: O(V·E). Floyd-Warshall all-pairs: O(V³). Use BFS for unweighted, Dijkstra for non-negative, Bellman-Ford for negative, Floyd for all-pairs.",
        },
        {
          kind: "recap",
          points: [
            "Unweighted: BFS.",
            "Non-negative weights: Dijkstra.",
            "Negative edges: Bellman-Ford.",
            "All pairs: Floyd-Warshall.",
          ],
        },
      ],
      sources: [
        {
          label: "Shortest paths (VisuAlgo)",
          url: "https://visualgo.net/en/sssp",
        },
      ],
      attribution: "Synthesis of Striver's A2Z graphs section.",
    },
    {
      slug: "mst-and-union-find",
      title: "MST & union-find",
      sections: [
        {
          kind: "concept",
          title: "MST",
          body: "Minimum spanning tree connects all vertices with minimum total edge weight. Prim (grow from a node, pick cheapest crossing edge) and Kruskal (sort edges, union if no cycle) both give O(E log E) or better.",
        },
        {
          kind: "concept",
          title: "Union-find (DSU)",
          body: "Disjoint set union supports find and union with path compression and union by rank: nearly O(1) amortised. Used in Kruskal, cycle detection, and connected components.",
        },
        {
          kind: "code",
          title: "Union-find",
          language: "javascript",
          starter:
            "class DSU {\n  constructor(n) { this.parent = Array.from({ length: n }, (_, i) => i); this.rank = new Array(n).fill(0); }\n  find(x) { return x; }\n  union(x, y) { return true; }\n}\n\nconst dsu = new DSU(4);\ndsu.union(0, 1); dsu.union(2, 3);\nconsole.log(dsu.find(0) === dsu.find(1));",
          solution:
            "class DSU {\n  constructor(n) { this.parent = Array.from({ length: n }, (_, i) => i); this.rank = new Array(n).fill(0); }\n  find(x) {\n    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);\n    return this.parent[x];\n  }\n  union(x, y) {\n    const rx = this.find(x), ry = this.find(y);\n    if (rx === ry) return false;\n    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;\n    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;\n    else { this.parent[ry] = rx; this.rank[rx]++; }\n    return true;\n  }\n}\n\nconst dsu = new DSU(4);\ndsu.union(0, 1); dsu.union(2, 3);\nconsole.log(dsu.find(0) === dsu.find(1)); // true",
          tests: [
            {
              input: "const d=new DSU(3); d.union(0,1); d.find(0)===d.find(2)",
              expected: "false",
            },
          ],
        },
        {
          kind: "recap",
          points: [
            "MST: Prim or Kruskal.",
            "Union-find: path compression + union by rank.",
            "Topological sort: Kahn's (BFS) or DFS post-order.",
          ],
        },
      ],
      sources: [
        { label: "MST (VisuAlgo)", url: "https://visualgo.net/en/mst" },
      ],
      attribution: "Synthesis of Striver's A2Z graphs section.",
    },
  ],
  interviewByte: {
    shape: "Find the shortest path in an unweighted graph.",
    strongAnswer:
      "BFS from the source; O(V+E) time and space. For weighted, use Dijkstra.",
    trap: "Using DFS for shortest path (not guaranteed shortest) or Dijkstra with negative edges.",
  },
  recap: [
    "Graphs: list for sparse, matrix for dense.",
    "BFS for unweighted shortest path; Dijkstra for non-negative.",
    "MST via Prim/Kruskal; union-find for connectivity.",
  ],
  attribution: "Synthesis of Striver's A2Z graphs section.",
};
