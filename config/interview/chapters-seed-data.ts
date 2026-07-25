type ChapterContent = {
  keyPoints: string[];
  tips: string[];
  [key: string]: unknown;
};

type ChapterSeed = {
  title: string;
  content: ChapterContent;
};

export const chaptersData: Record<string, ChapterSeed[]> = {
  "software-engineer": [
    {
      title: "Data Structures & Algorithms Fundamentals",
      content: {
        overview:
          "Data structures and algorithms form the foundation of efficient software. Mastering when and how to use each structure determines whether your application scales to millions of users or collapses under load. This chapter covers arrays, linked lists, hash tables, stacks, queues, trees, and graphs with JavaScript code examples and complexity analysis.",
        realLifeScenario:
          "Imagine you are building the core feed service for a social media platform with 100 million daily active users. Each user's feed must load in under 200ms. Posts need to be ranked by relevance, filtered for blocked content, and paginated efficiently. You start with a naive approach — load all posts from followed users into an array, sort by timestamp, paginate. At 500 followed users with 10 posts each, that is 5,000 posts sorted per request. Response time: 1.2 seconds. You introduce a min-heap to maintain the top-N ranked posts incrementally, a hash map for O(1) user session lookup, and a trie for instant autocomplete. The feed now loads in 150ms.",
        explanation: `## Arrays

Arrays store elements in contiguous memory, providing O(1) random access — you compute the address as \`baseAddress + index * elementSize\`. Insertion and deletion at arbitrary positions cost O(n) because subsequent elements must shift to maintain contiguity. JavaScript arrays are dynamic; when capacity is exceeded, the engine allocates a larger buffer (typically 1.5x to 2x) and copies existing elements over. This makes \`push\` amortized O(1).

\`\`\`javascript
const arr = [10, 20, 30, 40, 50];
arr.push(60);           // O(1) amortized
arr.pop();              // O(1)
arr.unshift(5);         // O(n) — shifts every element right
arr.splice(2, 0, 25);   // O(n) — inserts at index 2

// Sliding window pattern — O(n) time, O(1) space
function maxSubarraySum(nums, k) {
  let max = 0, window = 0;
  for (let i = 0; i < k; i++) window += nums[i];
  max = window;
  for (let i = k; i < nums.length; i++) {
    window += nums[i] - nums[i - k];
    max = Math.max(max, window);
  }
  return max;
}
\`\`\`

## Linked Lists

A linked list is a sequence of nodes where each node stores a value and a pointer to the next node. Unlike arrays, nodes do not require contiguous memory. Singly linked lists offer O(1) insertion and deletion at the head but O(n) lookup. Doubly linked lists add a \`prev\` pointer, enabling O(1) deletion at the tail as well. Use linked lists when building queues, implementing an LRU cache (paired with a hash map for O(1) lookups), or when you need frequent insertions at both ends.

\`\`\`javascript
class LinkedList {
  constructor() { this.head = null; this.tail = null; }
  prepend(value) {
    const node = { value, next: this.head };
    this.head = node;
    if (!this.tail) this.tail = node;
  }
  append(value) {
    const node = { value, next: null };
    if (!this.head) { this.head = this.tail = node; return; }
    this.tail.next = node;
    this.tail = node;
  }
}

// Reverse in-place — O(n) time, O(1) space
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

// Floyd's Tortoise and Hare — O(n) time, O(1) space
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
\`\`\`

## Hash Tables

Hash tables map keys to values using a hash function that distributes keys uniformly across buckets. A good hash function minimizes collisions, keeping operations at O(1) average time. JavaScript's \`Map\` uses separate chaining — each bucket holds a linked list of entries. When the load factor (entries per bucket) exceeds a threshold, the table resizes and rehashes all entries, an O(n) operation that is amortized O(1) per insertion. Open addressing (linear probing, quadratic probing) is an alternative that stores entries directly in the array, probing for the next empty slot on collision.

\`\`\`javascript
const cache = new Map();
function memoize(fn) {
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Two Sum — O(n) time using hash map
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}
\`\`\`

## Stacks and Queues

Stacks follow LIFO (Last In, First Out) — perfect for depth-first traversal, expression evaluation, and undo-redo. Queues follow FIFO (First In, First Out) — ideal for breadth-first traversal, task scheduling, and request buffering.

\`\`\`javascript
// Balanced parentheses using a stack — O(n)
function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if ('([{'.includes(ch)) { stack.push(ch); }
    else if (stack.pop() !== pairs[ch]) { return false; }
  }
  return stack.length === 0;
}

// Queue implemented with two stacks — amortized O(1) per operation
class Queue {
  constructor() { this.in = []; this.out = []; }
  enqueue(x) { this.in.push(x); }
  dequeue() {
    if (!this.out.length) {
      while (this.in.length) this.out.push(this.in.pop());
    }
    return this.out.pop();
  }
}
\`\`\`

## Trees

Binary Search Trees enforce the invariant: left subtree values < node value < right subtree values. This ordering enables O(log n) search, insertion, and deletion in a balanced tree. Without balancing, a BST can degenerate to O(n) — essentially a sorted linked list. Self-balancing variants like AVL and Red-Black trees use rotations during mutations to maintain logarithmic height. Tries (prefix trees) excel at string-based lookup operations like autocomplete.

\`\`\`javascript
class TreeNode {
  constructor(val) { this.val = val; this.left = this.right = null; }
}

// Level-order BFS — O(n)
function levelOrder(root) {
  if (!root) return [];
  const queue = [root], result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}

// Trie node for autocomplete
class TrieNode {
  constructor() { this.children = new Map(); this.isEnd = false; }
}
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }
  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch);
    }
    return node.isEnd;
  }
}
\`\`\`

## Graphs

Graphs model relationships: social networks, web page links, road networks, and dependency graphs. Adjacency lists (a map from each vertex to its neighbors) are memory-efficient for sparse graphs. Adjacency matrices (V x V boolean grids) offer O(1) edge lookups at O(V²) memory cost. BFS finds shortest paths in unweighted graphs using a queue. DFS uses a stack (or recursion) and is useful for topological sorting and cycle detection.

\`\`\`javascript
const graph = new Map();
function addEdge(u, v) {
  if (!graph.has(u)) graph.set(u, []);
  graph.get(u).push(v);
  if (!graph.has(v)) graph.set(v, []);
  graph.get(v).push(u);
}

// BFS shortest path — O(V + E)
function bfsShortestPath(start, target) {
  const queue = [[start]], visited = new Set([start]);
  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];
    if (node === target) return path;
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}
\`\`\`

## Complexity Reference

| Structure       | Access    | Search    | Insert    | Delete    |
|-----------------|-----------|-----------|-----------|-----------|
| Array           | O(1)      | O(n)      | O(n)      | O(n)      |
| Linked List     | O(n)      | O(n)      | O(1)*     | O(1)*     |
| Hash Table      | O(1) avg  | O(1) avg  | O(1) avg  | O(1) avg  |
| BST (balanced)  | O(log n)  | O(log n)  | O(log n)  | O(log n)  |
| Stack / Queue   | O(1)      | O(n)      | O(1)      | O(1)      |
| Graph adj list  | —    | O(V+E)    | O(1)      | O(V+E)    |

*At head; O(n) at arbitrary position`,
        keyPoints: [
          "Arrays provide O(1) random access but O(n) insertion — use when indexed reads dominate writes",
          "Linked lists offer O(1) head insertions and deletions — ideal for queues and LRU caches paired with hash maps",
          "Hash tables deliver O(1) average lookup — handle collisions with separate chaining or open addressing",
          "Balanced BSTs maintain O(log n) for all operations — prefer when sorted order and frequent inserts are both required",
          "BFS finds shortest paths in unweighted graphs; DFS uses less memory for deep exploration",
          "Stacks enable recursive backtracking and expression parsing; queues handle breadth-first processing",
          "Always analyze constraints before choosing a structure — operation frequency, memory limits, and data size matter most",
        ],
        tips: [
          "State time and space complexity before writing any code — it shows deliberate thinking",
          "Start with brute force, then optimize step by step — interviewers want to see your problem-solving process",
          "Practice implementing structures from scratch without built-in utilities",
          "Know the trade-offs: there is rarely one perfect data structure, only the right choice for your constraints",
          "Use the right tool: if you need sorted data with inserts, reach for a BST, not a sorted array",
        ],
        sampleQuestions: [
          "Design an LRU cache with O(1) get and put using a hash map and doubly linked list",
          "Find the shortest path between two nodes in an unweighted social network graph using BFS",
          "Implement an autocomplete system using a trie with prefix search and top-k suggestions",
          "Merge k sorted linked lists into a single sorted list — analyze all three approaches (divide-and-conquer, heap, sequential)",
        ],
      },
    },
    {
      title: "System Design & Architecture",
      content: {
        overview:
          "System design interviews evaluate your ability to architect large-scale distributed systems. You must understand trade-offs between consistency, availability, latency, and cost. This chapter covers scale estimation, API design, data modeling, caching, database sharding, load balancing, and communication patterns with practical examples.",
        realLifeScenario:
          "Your startup's URL shortener has grown from 100 to 10 million users. The single PostgreSQL database is at 90% CPU, reads are timing out, and the monolithic server crashes during viral link campaigns. You must redesign for scale: shard the database by user ID hash, introduce Redis caching for popular links, add a CDN for redirect responses, split the monolith into services (link creation, redirect, analytics), and use Kafka to decouple analytics writes from the critical redirect path. The new architecture handles 100,000 redirects per second with P99 latency under 10ms.",
        explanation: `## Requirements Gathering

Start every design by clarifying functional and non-functional requirements. Ask: "How many daily active users? What is the read-to-write ratio? What latency is acceptable? Do we need strong consistency or is eventual consistency sufficient?" Document these explicitly — they drive every subsequent decision.

## Scale Estimation

Estimate key metrics before designing. For a URL shortener with 100M DAU and each user creating 0.1 links per day:
- Write QPS: 100M × 0.1 / 86400 ≈ 115 writes/second
- Read QPS: Assume 100:1 read-to-write ratio → 11,500 reads/second
- Storage per year: 10M new links/day × 365 × ~500 bytes ≈ 1.8 TB/year

These numbers guide your database choice, caching strategy, and hardware provisioning.

\`\`\`javascript
// Rate limiter using sliding window log
class SlidingWindowRateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }
  allow(key) {
    const now = Date.now();
    if (!this.requests.has(key)) this.requests.set(key, []);
    const timestamps = this.requests.get(key).filter(t => now - t < this.windowMs);
    if (timestamps.length >= this.maxRequests) return false;
    timestamps.push(now);
    this.requests.set(key, timestamps);
    return true;
  }
}
\`\`\`

## API Design

Define clear REST or GraphQL endpoints. A URL shortener needs:
- \`POST /shorten\` — accepts long URL, returns short code
- \`GET /:code\` — redirects to the original URL
- \`GET /:code/stats\` — returns click analytics

Use HTTP status codes correctly: 201 for creation, 302 for redirect, 404 for unknown codes. Paginate list endpoints with cursor-based pagination for consistency under real-time writes.

## Data Modeling

Choose between SQL and NoSQL based on access patterns. A URL shortener benefits from a key-value store (DynamoDB, Redis) for the primary lookup: short code → long URL. But analytics data (click timestamps, referrers, geolocation) is better suited to a time-series database or a columnar store.

\`\`\`javascript
// Consistent hashing for cache node distribution
class ConsistentHash {
  constructor(nodes, virtualNodes = 150) {
    this.virtualNodes = virtualNodes;
    this.ring = [];
    for (const node of nodes) {
      for (let i = 0; i < virtualNodes; i++) {
        const hash = this._hash(\`\${node}:\${i}\`);
        this.ring.push({ hash, node });
      }
    }
    this.ring.sort((a, b) => a.hash - b.hash);
  }
  _hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
  getNode(key) {
    const hash = this._hash(key);
    for (const entry of this.ring) {
      if (entry.hash >= hash) return entry.node;
    }
    return this.ring[0].node;
  }
}
\`\`\`

## Caching Strategies

Caching is the most effective way to reduce database load. Common strategies:
- **Cache-aside**: Application checks cache first; on miss, loads from DB and populates cache. Simple but can cause cache stampedes on miss.
- **Write-through**: Every write goes to both cache and DB. Ensures consistency but adds write latency.
- **Write-behind**: Writes go to cache first, then asynchronously to DB. Fast writes but risk of data loss if cache fails.
- **Cache eviction**: LRU (Least Recently Used) is most common. LFU works when access frequency matters more than recency.

## Database Sharding

When a single database cannot handle the load, partition data across multiple databases. Common sharding strategies:
- **Range-based**: Shard by ID range (1-1M on shard A, 1M-2M on shard B). Simple but can cause hotspots.
- **Hash-based**: Hash the shard key and mod by the number of shards. Even distribution but resharding requires moving data.
- **Directory-based**: Use a lookup service to map keys to shards. Flexible but adds a hop.

## Load Balancing and CDN

Load balancers (NGINX, HAProxy, AWS ALB) distribute incoming traffic across server instances. Use round-robin for uniform request sizes, least connections for variable workloads. A CDN (CloudFront, Cloudflare) caches static and even dynamic content at edge locations, reducing latency for geographically distributed users.

\`\`\`javascript
class LoadBalancer {
  constructor(servers) { this.servers = servers; this.idx = 0; }
  roundRobin() {
    const server = this.servers[this.idx];
    this.idx = (this.idx + 1) % this.servers.length;
    return server;
  }
  leastConnections(connections) {
    return this.servers.reduce((a, b) =>
      (connections.get(a) || 0) <= (connections.get(b) || 0) ? a : b
    );
  }
}
\`\`\`

## Communication Patterns

- **Synchronous (REST, gRPC)**: Simple, request-response. Use gRPC for internal service-to-service calls (faster, typed contracts via protobuf).
- **Asynchronous (message queues, pub/sub)**: Kafka, RabbitMQ, or AWS SQS decouple producers from consumers. Essential for analytics, notifications, and any non-critical path.
- **Event-driven**: Services emit events when state changes; other services consume them. Enables loose coupling and independent scaling.`,
        keyPoints: [
          "Estimate scale first — DAU, QPS, storage, bandwidth — every design decision flows from these numbers",
          "Define API contracts explicitly before implementation: endpoints, request/response shapes, status codes, error formats",
          "Choose databases based on access patterns: key-value for lookups, document for flexible schemas, relational for complex joins",
          "Cache aggressively but design for cache misses — stampedes can cascade into outages",
          "Shard databases when a single instance cannot handle the load; hash-based sharding distributes most evenly",
          "Decouple critical and non-critical paths with message queues — analytics writes should never block user requests",
          "Discuss trade-offs openly: strong consistency costs availability (CAP theorem), and every abstraction adds latency",
        ],
        tips: [
          "Think out loud — interviewers evaluate your reasoning process, not just the final architecture diagram",
          "Start simple, then add complexity incrementally: a monolithic design that works is better than a distributed design that fails",
          "Always address failure scenarios: what happens when the cache goes down? The database? A service?",
          "Consider cost and operational complexity — mention when a simpler approach is 'good enough' for the scale",
          "Draw clear diagrams (client → CDN → LB → services → cache → DB) and explain each hop's purpose",
        ],
        sampleQuestions: [
          "Design a URL shortening service like TinyURL — cover encoding, redirection, analytics, and scaling",
          "Design a real-time collaborative document editor like Google Docs — address CRDTs, WebSocket, and persistence",
          "Design a ride-sharing system like Uber — handle location updates, matching, pricing, and surge",
          "Design a distributed messaging system like WhatsApp — ensure delivery guarantees, offline storage, and end-to-end encryption",
        ],
      },
    },
    {
      title: "Object-Oriented Design Patterns",
      content: {
        overview:
          "Design patterns provide battle-tested solutions to recurring software design problems. Mastering them demonstrates you can write code that is maintainable, extensible, and testable. This chapter covers the most frequently tested creational, structural, and behavioral patterns with JavaScript implementations.",
        realLifeScenario:
          "Your team is building a notification system that must support email, SMS, push notifications, and in-app alerts. Each channel has different formatting, delivery mechanisms, and rate limits. New channels will be added every quarter. If you hardcode each channel with if-else blocks, adding SMS requires modifying existing, tested code — violating the Open-Closed Principle. Using the Strategy pattern, each notification channel becomes a pluggable class. Adding SMS means creating a new strategy class with zero changes to existing code. The Observer pattern then lets the notification service notify subscribers when a message is sent, all without coupling.",
        explanation: `## Creational Patterns

### Singleton

The Singleton pattern ensures a class has exactly one instance and provides a global access point. Use it for shared resources like database connections, configuration objects, or logging services. The downside: singletons introduce global state that makes unit testing difficult because tests cannot easily isolate the instance.

\`\`\`javascript
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) return DatabaseConnection.instance;
    this.connection = this._connect();
    DatabaseConnection.instance = this;
  }
  _connect() {
    console.log('Creating new database connection');
    return { query: (sql) => console.log(\`Executing: \${sql}\`) };
  }
  query(sql) { return this.connection.query(sql); }
}

const db1 = new DatabaseConnection();
const db2 = new DatabaseConnection();
console.log(db1 === db2); // true
\`\`\`

### Factory Method

The Factory pattern delegates object creation to subclasses or a dedicated factory function. It decouples client code from concrete classes, making the system easier to extend.

\`\`\`javascript
class LoggerFactory {
  static createLogger(type) {
    switch (type) {
      case 'console': return { log: msg => console.log(msg) };
      case 'file':    return { log: msg => fs.appendFileSync('log.txt', msg + '\n') };
      case 'remote':  return { log: msg => fetch('/api/log', { method: 'POST', body: msg }) };
      default: throw new Error(\`Unknown logger type: \${type}\`);
    }
  }
}

const logger = LoggerFactory.createLogger('console');
logger.log('Application started');
\`\`\`

## Structural Patterns

### Adapter

The Adapter pattern allows incompatible interfaces to work together. It wraps an existing class with a new interface that the client expects. Essential when integrating third-party libraries or legacy code.

\`\`\`javascript
class StripePayment {
  charge(amount, currency) { return \`Charged $\${amount} \${currency} via Stripe\`; }
}

class PaymentProcessor {
  pay(usdAmount) { throw new Error('Not implemented'); }
}

class StripeAdapter extends PaymentProcessor {
  constructor() { super(); this.stripe = new StripePayment(); }
  pay(usdAmount) { return this.stripe.charge(usdAmount, 'USD'); }
}

const processor = new StripeAdapter();
console.log(processor.pay(49.99));
\`\`\`

### Decorator

The Decorator pattern attaches additional responsibilities to an object dynamically without modifying its class. Each decorator wraps the original object and adds its own behavior before or after delegating to the wrapped object.

\`\`\`javascript
class Coffee {
  cost() { return 5; }
  description() { return 'Coffee'; }
}

class MilkDecorator {
  constructor(coffee) { this.coffee = coffee; }
  cost() { return this.coffee.cost() + 1.5; }
  description() { return \`\${this.coffee.description()}, Milk\`; }
}

class SugarDecorator {
  constructor(coffee) { this.coffee = coffee; }
  cost() { return this.coffee.cost() + 0.5; }
  description() { return \`\${this.coffee.description()}, Sugar\`; }
}

let drink = new Coffee();
drink = new MilkDecorator(drink);
drink = new SugarDecorator(drink);
console.log(\`\${drink.description()}: $\${drink.cost()}\`);
\`\`\`

## Behavioral Patterns

### Observer

The Observer pattern (pub-sub) defines a one-to-many dependency between objects. When the subject changes state, all its dependents are notified automatically. Used extensively in event-driven architectures, UI frameworks, and reactive programming.

\`\`\`javascript
class EventBus {
  constructor() { this.subscribers = new Map(); }
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) this.subscribers.set(event, []);
    this.subscribers.get(event).push(callback);
    return () => this.unsubscribe(event, callback);
  }
  unsubscribe(event, callback) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) this.subscribers.set(event, callbacks.filter(cb => cb !== callback));
  }
  emit(event, data) {
    for (const cb of this.subscribers.get(event) || []) cb(data);
  }
}

const bus = new EventBus();
const unsub = bus.subscribe('user:created', user => console.log(\`Welcome \${user.name}\`));
bus.emit('user:created', { name: 'Alice' });
unsub();
\`\`\`

### Strategy

The Strategy pattern defines a family of interchangeable algorithms and encapsulates each one. The client can switch algorithms at runtime without changing the code that uses them.

\`\`\`javascript
class SortStrategy {
  sort(data) { throw new Error('Not implemented'); }
}

class BubbleSort extends SortStrategy {
  sort(data) {
    const arr = [...data];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
    return arr;
  }
}

class QuickSort extends SortStrategy {
  sort(data) {
    if (data.length <= 1) return data;
    const pivot = data[Math.floor(data.length / 2)];
    const left = data.filter(x => x < pivot);
    const middle = data.filter(x => x === pivot);
    const right = data.filter(x => x > pivot);
    return [...this.sort(left), ...middle, ...this.sort(right)];
  }
}

class Sorter {
  setStrategy(strategy) { this.strategy = strategy; }
  sort(data) { return this.strategy.sort(data); }
}

const sorter = new Sorter();
sorter.setStrategy(new QuickSort());
console.log(sorter.sort([3, 1, 4, 1, 5, 9]));
\`\`\`

## When to Use (and Not Use) Patterns

Patterns are guidelines, not rules. Force-fitting a pattern where simple code suffices adds accidental complexity. Use Strategy when you genuinely need runtime algorithm selection. Use Singleton sparingly — dependency injection with a single instance is often cleaner. Patterns solve specific problems: identify the problem first, then reach for the pattern that addresses it.`,
        keyPoints: [
          "Singleton ensures one instance but introduces global state — use dependency injection instead when possible",
          "Factory Method centralizes object creation and decouples client code from concrete classes",
          "Observer enables event-driven architectures but creates implicit dependencies — always provide unsubscribe/cleanup mechanisms",
          "Strategy enables runtime algorithm selection without conditionals — ideal for interchangeable behaviors like sort, validate, or notify",
          "Decorator adds responsibilities dynamically without subclassing — follows the Single Responsibility Principle",
          "Adapter makes incompatible interfaces work together without modifying either side — critical for integrating third-party code",
          "Favor composition over inheritance — composition is more flexible at runtime and avoids the fragile base class problem",
        ],
        tips: [
          "Identify the problem first, then apply the pattern — never start with 'which pattern should I use?'",
          "Be ready to critique each pattern: what are its downsides? When would you NOT use it?",
          "Understand the SOLID principles — patterns are implementations of these principles",
          "Write tests before refactoring to patterns — patterns should make code more testable, not less",
          "In an interview, sketch the class diagram first, then implement the key interactions",
        ],
        sampleQuestions: [
          "Design a parking lot system using OOP — handle multiple vehicle types, pricing tiers, and spot allocation",
          "Implement a file system with directories and files using the Composite pattern",
          "Design a vending machine with proper state management — use State pattern for idle, selecting, and dispensing states",
          "Model a chess game with piece movement validation — demonstrate inheritance, polymorphism, and Strategy pattern for move validation",
        ],
      },
    },
    {
      title: "Operating Systems & Concurrency",
      content: {
        overview:
          "Understanding operating system concepts — processes, threads, synchronization, memory management — is essential for writing correct concurrent programs and acing senior engineering interviews. This chapter explains these concepts with practical code examples and real debugging scenarios.",
        realLifeScenario:
          "Your Node.js web server handles 10,000 concurrent WebSocket connections. Under peak load, response latency spikes from 50ms to 3 seconds. You discover that a synchronous file write in the request handler is blocking the event loop, stalling all other connections. Moving the write to a worker thread (using worker_threads) and using a buffer queue decouples I/O from the critical path. But now you face a new problem: multiple worker threads reading and writing a shared configuration object cause inconsistent state. You introduce a mutex (via Atomic operations or a locking library) to synchronize access. P99 latency drops back to 60ms.",
        explanation: `## Processes vs Threads

A process is an independent execution unit with its own memory space, file descriptors, and system resources. Processes are isolated — one process crash does not affect others. A thread is a lightweight unit of execution within a process; threads share the same memory space, enabling fast communication but introducing race conditions.

Context switching between threads is cheaper than between processes because threads share address space (no TLB flush needed). However, threads in the same process are not protected from each other — a buffer overflow in one thread can corrupt data in another.

\`\`\`javascript
// Simulating a race condition
let counter = 0;
async function increment() {
  const current = counter;   // Read
  await Promise.resolve();   // Simulate async work
  counter = current + 1;     // Write — interleaving causes lost updates
}

await Promise.all(Array.from({ length: 100 }, () => increment()));
console.log(counter); // Likely less than 100 — race!
\`\`\`

## Synchronization Primitives

### Mutex (Mutual Exclusion)

A mutex ensures that only one thread accesses a shared resource at a time. Threads acquire the lock before entering the critical section and release it when done. Always lock in a consistent order across threads to prevent deadlocks.

\`\`\`javascript
class Mutex {
  constructor() { this._locked = false; this._queue = []; }
  acquire() {
    return new Promise(resolve => {
      if (!this._locked) { this._locked = true; resolve(); }
      else this._queue.push(resolve);
    });
  }
  release() {
    if (this._queue.length > 0) { const next = this._queue.shift(); next(); }
    else this._locked = false;
  }
  async run(fn) {
    await this.acquire();
    try { return await fn(); }
    finally { this.release(); }
  }
}

const mutex = new Mutex();
let sharedCounter = 0;
async function safeIncrement() { await mutex.run(() => { sharedCounter++; }); }
\`\`\`

### Semaphore

A semaphore controls access to a fixed number of identical resources (e.g., a thread pool with N threads). A counting semaphore maintains a counter; acquire decrements, release increments. When the counter reaches zero, subsequent acquires block until a release occurs.

### Condition Variables

Condition variables allow threads to wait for a specific condition. A thread checks a predicate; if false, it waits on the condition variable. Another thread signals when the predicate may have changed.

\`\`\`javascript
class BoundedQueue {
  constructor(capacity) {
    this.queue = [];
    this.capacity = capacity;
    this.notEmpty = Promise.resolve();
    this.notFull = Promise.resolve();
  }
  async enqueue(item) {
    while (this.queue.length >= this.capacity) await this.notFull;
    this.queue.push(item);
    this.notEmpty = Promise.resolve();
  }
  async dequeue() {
    while (this.queue.length === 0) await this.notEmpty;
    const item = this.queue.shift();
    this.notFull = Promise.resolve();
    return item;
  }
}
\`\`\`

## Deadlock

Deadlock requires four conditions (Coffman conditions):
1. **Mutual Exclusion**: Resources cannot be shared
2. **Hold and Wait**: A thread holds resources while waiting for others
3. **No Preemption**: Resources cannot be forcibly taken
4. **Circular Wait**: A cycle of threads each waiting for a resource held by the next

Break any one condition to prevent deadlock. The most practical approach is to enforce a global lock ordering — always acquire locks A, B, C in that order, never B then A.

## Memory Management

The stack stores local variables and function call frames (LIFO). Allocation and deallocation are automatic. The heap stores dynamically allocated memory. JavaScript uses garbage collection (mark-and-sweep) to reclaim unreachable heap objects.

**Memory leak patterns:**
- Forgotten timers or intervals
- Detached DOM elements (React components not cleaning up)
- Closures holding references to large objects

\`\`\`javascript
// Memory leak: interval not cleaned up
class LeakyComponent {
  start() {
    this.interval = setInterval(() => {
      console.log(this.data); // closure prevents GC
    }, 1000);
  }
}

// Correct approach
class CleanComponent {
  start() {
    this.interval = setInterval(() => this.tick(), 1000);
  }
  destroy() { clearInterval(this.interval); }
  tick() { console.log(this.data); }
}
\`\`\`

## Amdahl's Law

Amdahl's Law states that the maximum speedup from parallelization is limited by the sequential portion of the workload:

Speedup = 1 / (S + (1 - S) / N)

Where S is the sequential fraction and N is the number of processors. If 10% of a task must run sequentially (S = 0.1), the maximum speedup with infinite processors is only 10x.

\`\`\`javascript
function amdahlSpeedup(S, N) {
  return 1 / (S + (1 - S) / N);
}
console.log(amdahlSpeedup(0.1, 4));      // ~3.08x
console.log(amdahlSpeedup(0.1, Infinity)); // 10x maximum
\`\`\``,
        keyPoints: [
          "Processes have isolated memory — crash-safe but communication is expensive; threads share memory — fast but prone to race conditions",
          "Race conditions occur when concurrent operations interleave on shared mutable state — use mutexes or atomics to synchronize",
          "Deadlock requires four conditions: mutual exclusion, hold-and-wait, no preemption, circular wait — break any one to prevent it",
          "Stack memory is automatically managed (LIFO, fast); heap memory requires garbage collection or manual management",
          "Amdahl's Law: parallel speedup is fundamentally limited by the sequential fraction of the workload",
          "Event loop concurrency (JavaScript, Python asyncio) is single-threaded but handles I/O efficiently without locks",
          "Higher-level abstractions (async/await, worker pools) are safer and more productive than raw threads and locks",
        ],
        tips: [
          "Understand your language's concurrency model deeply — event loop in JS, goroutines in Go, virtual threads in Java — each has different trade-offs",
          "Use higher-level abstractions (Promise.all, worker_threads, async/await) instead of manual lock management whenever possible",
          "Profile before optimizing concurrency — guessing about bottlenecks is unreliable; use profiling tools first",
          "Know Amdahl's Law: optimizing the serial portion often yields better results than parallelizing further",
          "For JavaScript: never block the event loop with synchronous CPU-intensive work — offload to worker threads",
        ],
        sampleQuestions: [
          "Implement a thread-safe bounded blocking queue with producers and consumers",
          "Solve the dining philosophers problem — demonstrate deadlock prevention with lock ordering",
          "Design a rate limiter for API requests using a sliding window or token bucket algorithm",
          "Explain what happens when you type a URL in a browser — cover OS context: process creation, network stack, and event loop",
        ],
      },
    },
    {
      title: "Networking & Distributed Systems",
      content: {
        overview:
          "Modern applications are distributed by nature — spanning multiple servers, data centers, and geographic regions. This chapter covers network protocols (TCP, UDP, HTTP), distributed system concepts (CAP theorem, consensus, consistency models), and practical patterns for building reliable distributed systems.",
        realLifeScenario:
          "Your e-commerce platform serves customers globally from three data centers (US, EU, Asia). During a network partition between the US and EU data centers, EU customers see stale inventory — items shown as in stock are actually sold out. The CAP theorem tells you that during a network partition, you must choose between consistency (CP) and availability (AP). You initially favored availability, but the resulting overselling causes customer anger. You implement a hybrid approach: strongly consistent inventory counts backed by a consensus algorithm (Raft) for the source of truth, with read replicas serving stale data during partitions but clearly displaying 'may be outdated' warnings.",
        explanation: `## TCP vs UDP

**TCP** provides reliable, ordered delivery with error checking, flow control, and congestion avoidance. The three-way handshake (SYN → SYN-ACK → ACK) establishes a connection, adding one round-trip time (RTT) of latency before data can flow. TCP uses sequence numbers, acknowledgments, and retransmission to guarantee delivery. Flow control (sliding window) prevents the sender from overwhelming the receiver. Congestion avoidance (slow start, congestion avoidance, fast recovery) prevents network collapse.

**UDP** is connectionless and unreliable — no handshake, no ordering guarantee, no retransmission. It has lower latency and overhead than TCP, making it suitable for real-time applications where occasional data loss is acceptable: video streaming, online gaming, voice calls (WebRTC), and DNS lookups.

\`\`\`javascript
// UDP server using dgram
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
server.on('message', (msg, rinfo) => {
  console.log(\`Received \${msg} from \${rinfo.address}:\${rinfo.port}\`);
  server.send('ACK', rinfo.port, rinfo.address);
});
server.bind(41234);
\`\`\`

## HTTP Evolution

**HTTP/1.1** — one request per TCP connection. Head-of-line blocking means a slow response delays subsequent requests. Workaround: multiple parallel connections (typically 6 per domain in browsers).

**HTTP/2** — multiplexes multiple requests over a single TCP connection using streams. Eliminates head-of-line blocking at the application layer but still suffers from TCP-level head-of-line blocking (a lost packet blocks all streams).

**HTTP/3 (QUIC)** — built on UDP instead of TCP. Eliminates TCP head-of-line blocking entirely. Features 0-RTT connection establishment for returning clients, connection migration (survives IP address changes), and built-in encryption.

\`\`\`javascript
// HTTP request with retry and exponential backoff
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return await response.json();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
\`\`\`

## DNS Resolution

When you type a URL, the DNS resolution flow is:
1. Browser checks its cache, then the OS cache
2. The OS resolver queries the recursive resolver (usually ISP or Cloudflare 1.1.1.1)
3. The recursive resolver queries the root nameserver → TLD nameserver (.com) → authoritative nameserver
4. The authoritative nameserver returns the IP address (A or AAAA record)
5. The recursive resolver caches and returns the result

The entire process typically takes 20-120ms. DNS results are cached at each level with TTL controlling cache duration.

## CAP Theorem

The CAP theorem states that a distributed data store can provide at most two of three guarantees:

- **Consistency (C)**: Every read receives the most recent write or an error
- **Availability (A)**: Every request receives a (non-error) response
- **Partition Tolerance (P)**: The system continues to operate despite network partitions

During a network partition (inevitable in distributed systems), you must choose between CP (reject writes or return errors) and AP (accept writes, serve potentially stale reads). Most systems choose AP for user-facing features and CP for critical operations like payments.

## Distributed Consensus — Raft

Raft is a consensus algorithm that ensures multiple nodes agree on a sequence of state changes. Key components:

1. **Leader Election**: Nodes are in one of three states — leader, candidate, or follower. Leaders send heartbeats; if followers timeout, they become candidates and start an election.
2. **Log Replication**: The leader accepts client requests, appends to its log, and replicates to followers. An entry is committed once a majority of nodes have replicated it.
3. **Safety**: Raft guarantees committed entries are durable and only one leader exists per term.

\`\`\`javascript
class RaftNode {
  constructor(id, peers) {
    this.id = id;
    this.peers = peers;
    this.state = 'follower';
    this.currentTerm = 0;
    this.votedFor = null;
  }
  startElection() {
    this.state = 'candidate';
    this.currentTerm++;
    this.votedFor = this.id;
    let votes = 1;
    for (const peer of this.peers) {
      const granted = peer.requestVote(this.currentTerm, this.id);
      if (granted) votes++;
    }
    if (votes > this.peers.length / 2) {
      this.state = 'leader';
      this.startHeartbeat();
    }
  }
  requestVote(term, candidateId) {
    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.votedFor = candidateId;
      return true;
    }
    return false;
  }
  startHeartbeat() {
    setInterval(() => {
      for (const peer of this.peers) peer.receiveHeartbeat(this.currentTerm, this.id);
    }, 50);
  }
}
\`\`\`

## Consistency Models

- **Strong Consistency**: Every read returns the most recent write. Requires coordination (slower, less available).
- **Eventual Consistency**: If no new writes occur, all replicas will eventually converge. Simple, highly available, but can serve stale data.
- **Causal Consistency**: Writes that are causally related are seen in order by all processes. Concurrent writes can be seen in different orders.
- **Read-Your-Writes**: A client always sees its own writes, but other clients may not.

## Practical Distributed System Patterns

- **Circuit Breaker**: Prevents cascading failures by detecting unhealthy downstream services and failing fast instead of waiting for timeouts.
- **Bulkhead**: Isolates resources into separate pools so failure in one pool does not drain shared resources.
- **Health Checks**: Services expose health endpoints; orchestrators (Kubernetes) use liveness and readiness probes.
- **Distributed Tracing**: Trace a single request across multiple services using correlation IDs (OpenTelemetry).
- **Idempotency**: Ensure retrying an operation produces the same result (critical for payment processing).`,
        keyPoints: [
          "TCP provides reliable ordered delivery with flow control and congestion avoidance — use for APIs and file transfers",
          "UDP is faster but unreliable — ideal for streaming, gaming, DNS, and real-time communications",
          "HTTP/3 (QUIC) eliminates TCP head-of-line blocking by building on UDP with 0-RTT handshakes",
          "DNS resolution traverses browser cache → OS resolver → recursive resolver → authoritative server; each level caches with TTL",
          "CAP theorem: during a network partition, choose between consistency (CP) or availability (AP) — both are impossible together",
          "Raft consensus provides fault-tolerant replicated state machines with leader election and log replication",
          "Circuit breakers, bulkheads, distributed tracing, and idempotency keys are essential production patterns for reliable distributed systems",
        ],
        tips: [
          "Know the full TCP connection lifecycle: three-way handshake, data transfer with sequence numbers, and four-way teardown",
          "Understand DNS deeply — it is often the root cause of performance issues and outages in distributed systems",
          "Be familiar with service mesh concepts: sidecar proxies (Envoy), mTLS, traffic splitting, and observability",
          "Discuss observability in every system design: distributed tracing (OpenTelemetry), structured logging, and metrics (Prometheus)",
          "Always design for failure: assume networks partition, services crash, and disks fill up — graceful degradation is a feature",
        ],
        sampleQuestions: [
          "Explain the end-to-end flow when you type https://www.google.com — cover DNS, TCP, TLS, HTTP, and rendering",
          "Design a distributed key-value store with eventual consistency — discuss hinted handoff, read repair, and Merkle trees",
          "Explain how consistent hashing works, why DynamoDB and Cassandra use it, and how it handles node addition and removal",
          "Describe how Raft leader election works — compare with Paxos and explain why Raft is considered more understandable",
          "Design a reliable messaging queue (like Kafka) with at-least-once and exactly-once delivery semantics",
        ],
      },
    },
  ],
  "frontend-engineer": [
    {
      title: "HTML & The DOM",
      content: {
        overview:
          "HTML is the foundation of every web page. This chapter covers HTML document structure, semantic elements, the DOM tree, event handling, form validation, and accessibility — essential topics for frontend interviews that test your understanding of how the web platform works at its core.",
        realLifeScenario:
          "Your team builds a complex form with 20+ input fields that must work for keyboard-only users and screen readers. The current implementation uses generic <div> elements with JavaScript click handlers, making it inaccessible. Users who rely on screen readers cannot navigate the form, and keyboard tab order jumps erratically. You refactor to use semantic HTML: <form>, <fieldset>, <legend>, <label>, and proper input types. The form becomes navigable by tab, screen readers announce field labels, and built-in browser validation catches errors without JavaScript. This demonstrates that semantic HTML is faster, more accessible, and more maintainable than div-based layouts.",
        explanation:
          "The DOM (Document Object Model) is a tree representation of HTML parsed by the browser. Each HTML element becomes a DOM node that JavaScript can traverse, modify, or delete. The document object is the entry point. Semantic elements (<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>) provide meaning to both browsers and assistive technologies. Event flow has two phases: capturing (root → target) and bubbling (target → root). Event delegation leverages bubbling to handle events efficiently at a parent level using event.target. Forms have built-in validation via input types (email, url, number), required attributes, pattern regex, and the Constraint Validation API. ARIA attributes (role, aria-label, aria-describedby) supplement semantics when native HTML is insufficient.",
        keyPoints: [
          "DOM is a tree of nodes parsed from HTML — document, elements, text nodes, comments; entry point is document object",
          "Semantic HTML (<header>, <nav>, <main>, <section>, <article>, <footer>) improves SEO, accessibility, and code clarity",
          "Event propagation: capturing phase (root → target) then bubbling phase (target → root) — event delegation uses bubbling",
          "Form validation: HTML5 input types, required/pattern/min/max attributes, Constraint Validation API, ValidityState object",
          "Accessibility: semantic HTML first, ARIA attributes second, keyboard navigation (tabindex), focus management, color contrast",
        ],
        tips: [
          "Always use semantic HTML elements before resorting to ARIA — built-in semantics are free and more reliable",
          "Use event delegation for dynamic content — a single listener on a parent catches events from all current and future children",
          "Prefer <label> wrapping or htmlFor attribute to associate labels with inputs — improves click target size and screen reader support",
          "Use inert attribute to make elements unfocusable and invisible to assistive technology — simpler than managing tabindex manually",
        ],
        sampleQuestions: [
          "What is the purpose of the DOCTYPE declaration in HTML?",
          "What are the essential elements of an HTML document structure?",
          "What meta tags are essential for SEO and responsive design?",
          "How do you include CSS and JavaScript in an HTML document?",
          "What are semantic HTML elements and why are they important?",
          "Explain the purpose of HTML5 semantic elements: header, nav, main, section, article, aside, footer.",
          "What is the purpose of the <figure> and <figcaption> elements?",
          "Explain the <details> and <summary> elements.",
          "Explain the difference between innerHTML, textContent, and innerText.",
          "What is the DOMContentLoaded event and how is it different from the load event?",
          "How do you create, append, and remove DOM elements dynamically?",
          "What is the difference between event bubbling and event capturing?",
          "What properties does the event object contain?",
          "How do you stop event propagation and prevent default browser behavior?",
          "What are custom events and how do you create and dispatch them?",
          "Explain the addEventListener method and its options parameter.",
          "How does HTML form validation work without JavaScript?",
          "What are the different input types in HTML5 and when should you use each?",
          "Explain the difference between GET and POST methods in HTML forms.",
          "What are form attributes like required, pattern, min, max, placeholder, and autocomplete?",
          "What is the purpose of ARIA attributes?",
          "What is the difference between aria-label, aria-labelledby, and aria-describedby?",
          "How do you make a website keyboard accessible?",
          "What is the purpose of the alt attribute and what happens when it's missing?",
          "What are Web Components and what technologies power them?",
          "What is the Shadow DOM and how does it provide encapsulation?",
          "What are custom elements and how do you define them?",
          "Explain the difference between async and defer attributes on script tags.",
          "How does script placement affect page rendering?",
          "What is the DOM and how does it work?",
          "Explain event delegation in JavaScript.",
        ],
      },
    },
    {
      title: "CSS & Visual Design",
      content: {
        overview:
          "CSS is deceptively complex. Modern interviews test not just Flexbox and Grid, but your understanding of layout algorithms, specificity, animations, and performance. This chapter covers the cascade, box model, responsive design, and modern CSS features.",
        realLifeScenario:
          "You're building a product grid that must work on mobile (1 column), tablet (2 columns), and desktop (4 columns) with equal-height cards. Flexbox wraps items but they have different heights. Grid with grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) creates equal-width columns, but cards still have different heights. Solution: display: grid; grid-template-rows: masonry isn't widely supported yet, so you use subgrid or set a fixed height with overflow: hidden and a gradient fade at the bottom for long content.",
        explanation:
          "The cascade: inline > ID > class > element — specificity is calculated as (inline, ID, class, element). Flexbox: one-dimensional layout, great for navigation bars, centering, and distributing space. Grid: two-dimensional layout, excellent for page structure and complex layouts. Responsive design: mobile-first with min-width media queries, fluid typography using clamp(), relative units (rem, em, vw). Container queries let components respond to their parent's size, not just the viewport. CSS custom properties enable dynamic theming without preprocessors.",
        keyPoints: [
          "Box model: content-box vs border-box — border-box is almost always preferred",
          "Stacking context: z-index only works within the same stacking context",
          "Transform and opacity trigger compositing (GPU-accelerated), not layout",
          "Accessibility: ARIA labels, focus management, color contrast (WCAG 4.5:1 ratio)",
          "Critical CSS: inline above-the-fold styles, defer non-critical",
        ],
        tips: [
          "Use CSS Grid for layout, Flexbox for components — each has strengths",
          "Avoid !important — it breaks the cascade and makes debugging harder",
          "CSS Modules, Tailwind, or CSS-in-JS — know the trade-offs of each approach",
          "Accessibility is not optional: semantic HTML, proper heading hierarchy, keyboard navigation",
        ],
        sampleQuestions: [
          "Explain the CSS box model and the difference between content-box and border-box.",
          "Explain the concept of specificity in CSS and how the cascade works.",
          "What is Flexbox and how does it work?",
          "What is CSS Grid and how does it differ from Flexbox?",
          "Explain CSS positioning: static, relative, absolute, fixed, and sticky.",
          "How does responsive design work with media queries?",
          "What are CSS custom properties (variables) and how do they differ from preprocessor variables?",
          "What is the difference between em, rem, px, vw, and other CSS units?",
          "Explain the stacking context and how z-index works.",
          "What are container queries and how are they different from media queries?",
          "How do CSS animations work with @keyframes?",
          "What is the difference between CSS transitions and animations?",
          "How do CSS transforms work?",
          "Explain CSS selectors, combinators, and pseudo-classes.",
          "What are CSS pseudo-elements and how are they used?",
          "What are CSS functions like calc(), min(), max(), and clamp()?",
          "Explain CSS @layer and the cascade layer system.",
          "What is CSS nesting and how does it work?",
          "What is the :has() selector and why is it called the 'parent selector'?",
          "What is the aspect-ratio property in CSS?",
          "What are object-fit and object-position in CSS?",
          "How do CSS backgrounds and gradients work?",
          "How does the CSS cascade and inheritance work?",
          "What are CSS preprocessors (Sass, Less) and when should you use them?",
          "Explain CSS methodologies like BEM, SMACSS, and utility-first CSS.",
          "How does the CSS display property work and what values are available?",
          "What are CSS overflow and clipping techniques?",
          "What are CSS transitions and how do you use them?",
        ],
      },
    },
    {
      title: "JavaScript Deep Dive",
      content: {
        overview:
          "JavaScript is the language of the web. This chapter covers the core concepts that every frontend interview tests: closures, event loop, prototypes, promises, async patterns, and the full breadth of JavaScript fundamentals. Master these concepts to write robust, performant, and maintainable code.",
        realLifeScenario:
          "Your team is debugging a memory leak in a React dashboard. The component fetches stock data on a 5-second interval but doesn't clean up the interval on unmount. Users report the page becomes sluggish after 30 minutes. The fix: storing the interval ID in a ref and clearing it in the useEffect cleanup function. This scenario tests understanding of closures (the interval callback closes over stale state) and the cleanup lifecycle.",
        explanation:
          "Closures: a function retains access to its outer scope — crucial for callbacks, event handlers, and module patterns. The event loop: call stack executes synchronous code, microtask queue (Promise.then, queueMicrotask) runs after each macrotask, macrotask queue (setTimeout, I/O) runs next. Prototypes: every object has a [[Prototype]] chain — property lookup walks up the chain. Async/await: syntactic sugar over Promises, each await creates a microtask continuation. Understanding these fundamentals prevents subtle bugs.",
        keyPoints: [
          "Hoisting: var declarations are hoisted, let/const are not initialized until declaration",
          "this binding: determined by call site — arrow functions capture parent this",
          "Event bubbling vs capturing: bubbling (child → parent), capturing (parent → child)",
          "Debouncing vs throttling: debounce waits for pause, throttle limits rate",
          "Module systems: ES modules (import/export) are static, CommonJS (require) is dynamic",
        ],
        tips: [
          "Write polyfills to prove deep understanding — implement Promise.all, debounce, etc.",
          "Understand the 'why' behind JavaScript quirks — they exist for backward compatibility",
          "Use browser dev tools: performance tab, memory profiler, network throttling",
          "Modern JS (ES6+) is expected — know arrow functions, destructuring, spread, optional chaining",
        ],
        sampleQuestions: [
          "What are the primitive data types in JavaScript?",
          "What is the difference between null and undefined?",
          "Explain the difference between == and ===.",
          "What is the difference between var, let, and const?",
          "What is type coercion in JavaScript?",
          "Explain truthy and falsy values in JavaScript.",
          "What is the difference between primitive and reference types?",
          "How does JavaScript handle implicit type conversion?",
          "What are template literals and how are they useful?",
          "Explain the concept of 'Strict Mode' in JavaScript.",
          "What is scope in JavaScript?",
          "Explain the difference between global scope, function scope, and block scope.",
          "What is lexical scoping in JavaScript?",
          "What is a scope chain and how does it work?",
          "What is an execution context?",
          "Explain variable hoisting in JavaScript.",
          "What is the Temporal Dead Zone (TDZ) in JavaScript?",
          "How does the call stack work in JavaScript?",
          "Explain the difference between function declarations and function expressions.",
          "What is the difference between a regular function and an arrow function in terms of scope?",
          "What are first-class functions in JavaScript?",
          "What are higher-order functions?",
          "What is a callback function?",
          "Explain closures with a practical example.",
          "What is function currying?",
          "What is function composition?",
          "What is a pure function and what are its benefits?",
          "How does the bind() method work?",
          "What is the difference between call(), apply(), and bind()?",
          "What is the difference between arrow functions and regular functions?",
          "How do you create an object in JavaScript?",
          "What are object prototypes?",
          "Explain the prototype chain in JavaScript.",
          "What is the difference between __proto__ and prototype?",
          "How does prototypal inheritance work?",
          "How does Object.create() work?",
          "What is the new keyword and how does it work?",
          "What is a constructor function?",
          "Explain the class syntax in JavaScript.",
          "Explain the this keyword in JavaScript.",
          "What is asynchronous programming in JavaScript?",
          "What is the event loop in JavaScript?",
          "What is the difference between synchronous and asynchronous code?",
          "What are Web APIs in the browser environment?",
          "What is a callback queue and how does it work?",
          "What is a microtask queue?",
          "Explain the difference between setTimeout and Promise in terms of execution order.",
          "Explain the Promise object in JavaScript.",
          "What is async/await in JavaScript?",
          "What will the following code output and why? console.log('1'); setTimeout(() => console.log('2'), 0); Promise.resolve().then(() => console.log('3')); console.log('4');",
          "What are Map and Set in JavaScript?",
          "What are WeakMap and WeakSet?",
          "What are Generators and Iterators in JavaScript?",
          "What are Symbols in JavaScript?",
          "What is the Proxy object in JavaScript?",
          "What is the Reflect API in JavaScript?",
          "What is debouncing and throttling in JavaScript?",
          "What is memoization in JavaScript?",
          "Explain ES Modules vs CommonJS.",
          "What is optional chaining and nullish coalescing in JavaScript?",
          "What is destructuring in JavaScript?",
          "What is the spread and rest operator in JavaScript?",
          "What are the different ways to handle errors in JavaScript?",
          "How do JavaScript timers work? (setTimeout, setInterval, requestAnimationFrame)",
          "What is the difference between localStorage, sessionStorage, and cookies?",
          "What is event delegation in JavaScript?",
          "How does garbage collection work in JavaScript?",
          "Explain the structuredClone API in JavaScript.",
          "What are regular expressions in JavaScript?",
          "What is BigInt in JavaScript?",
          "What is globalThis in JavaScript?",
          "What are the different Array methods and how do map, filter, and reduce work?",
          "What is the Iterator protocol and how does for...of work?",
          "How does the comma operator work in JavaScript?",
          "Explain the concept of temporal dead zone with let and const variables.",
        ],
      },
    },
    {
      title: "Browser APIs & Web Platform",
      content: {
        overview:
          "Modern browsers provide powerful APIs that extend JavaScript beyond the core language. This chapter covers the Web Storage API, Fetch API, WebSockets, Canvas, Geolocation, Web Workers, Service Workers, the History API, and performance APIs — essential knowledge for building rich, performant web applications.",
        realLifeScenario:
          "Your team builds an offline-capable note-taking app. Users create notes while online and expect them to be available even without internet. You implement a Service Worker that caches HTML, CSS, and JavaScript on first load (install event). The fetch event intercepts network requests — if the network is available, it fetches fresh content and updates the cache; if offline, it serves from the cache (cache-first strategy). For note data, you use IndexedDB to store user notes locally and sync them to the server when connectivity resumes using a background sync event. The result: users can create, edit, and delete notes offline, and changes sync automatically when back online.",
        explanation:
          "Web Storage: localStorage persists across tabs and browser restarts (5MB limit, synchronous); sessionStorage persists only for the current tab session. Fetch API: modern replacement for XMLHttpRequest, returns Promises, supports request/response streaming, and the AbortController for cancellation. WebSockets: full-duplex communication over a single TCP connection, ideal for real-time apps (chat, notifications, live updates). Canvas 2D API: pixel-based drawing for graphics, games, and data visualization. Web Workers: run JavaScript in background threads without DOM access, communicate via postMessage — use for CPU-intensive tasks. Service Workers: programmable network proxies that enable offline support, push notifications, and background sync. The History API: pushState and replaceState for SPA navigation without page reloads. Performance APIs: Navigation Timing, Resource Timing, Performance Observer for measuring real-world performance.",
        keyPoints: [
          "localStorage (persistent, 5MB, synchronous) vs sessionStorage (tab-scoped) vs IndexedDB (asynchronous, large storage, structured data)",
          "Fetch API: Promise-based, supports streaming, AbortController for cancellation, no automatic cookie sending with credentials: 'omit'",
          "WebSockets: ws:// or wss://, full-duplex, used for real-time apps — handle reconnection with exponential backoff",
          "Web Workers: background threads, no DOM access, communicate via postMessage — offload parsing, crypto, or image processing",
          "Service Workers: intercept fetch events, cache assets programmatically, enable offline support via Cache API and IndexedDB",
        ],
        tips: [
          "Use localStorage for small preference data, IndexedDB for structured or large data — never block the main thread with synchronous storage",
          "Always handle fetch errors gracefully — network requests can fail for many reasons, provide fallback UI",
          "Register Service Workers progressively — they're not supported in all browsers, and the site should work without them",
          "Use Performance Observer instead of manual performance.mark() / measure() calls for cleaner instrumentation",
        ],
        sampleQuestions: [
          "What are Web Workers and when would you use them?",
          "Explain the difference between localStorage and sessionStorage.",
          "How does the Fetch API work and how is it different from XMLHttpRequest?",
          "What are WebSockets and when would you use them?",
          "What is a Service Worker and how does it enable offline support?",
          "Explain the Canvas API and how it differs from SVG.",
          "What is the History API and how does it enable SPAs?",
          "How does IndexedDB work and when should you use it?",
          "What are the Navigation Timing and Resource Timing APIs used for?",
        ],
      },
    },
    {
      title: "React & Modern Frameworks",
      content: {
        overview:
          "React dominates frontend interviews. This chapter covers reconciliation, hooks, state management, performance optimization, and the rendering lifecycle.",
        realLifeScenario:
          "A social media feed component re-renders the entire list when a single post gets a new like. Users on mid-range phones experience janky scrolling. You identify the issue: the parent component creates a new array reference on every render, causing all child Post components to re-render. Solutions: use React.memo with stable props, extract the list into a separate component with its own state, or virtualize with react-window. The result: scroll performance improves from 15fps to 60fps.",
        explanation:
          "Reconciliation: React compares virtual DOM trees using a diffing algorithm — key props help identify which children changed. Fiber architecture enables incremental rendering (time slicing) and prioritization. Hooks: useState manages local state, useEffect handles side effects (subscriptions, data fetching), useMemo/useCallback optimize re-renders, useRef persists across renders without causing re-renders. State management: lifting state up, Context API for global state, Redux/Zustand for complex state logic. Server components (RSC) render on the server, reducing client JS bundle.",
        keyPoints: [
          "Virtual DOM: batching updates minimizes actual DOM mutations",
          "useEffect cleanup: prevents memory leaks from subscriptions and timers",
          "Controlled vs uncontrolled: React state vs DOM ref for form inputs",
          "Code splitting: React.lazy + Suspense for route-based chunking",
          "StrictMode: double-invokes effects in development to surface bugs",
        ],
        tips: [
          "Understand when NOT to use useEffect — derived state belongs in useMemo",
          "Rendering too often? Check: are you creating new objects/arrays in render?",
          "Server components are the future — understand streaming SSR and partial hydration",
          "Performance: React DevTools Profiler identifies unnecessary re-renders instantly",
        ],
        sampleQuestions: [
          "What is the virtual DOM and how does React use it?",
          "What are React Hooks and why do we use them?",
          "What is the difference between useEffect and useLayoutEffect?",
          "What is JSX in React?",
          "What are Pure Components in React?",
          "What is the difference between controlled and uncontrolled components?",
          "What is React.memo and when should you use it?",
          "Explain the concept of reconciliation in React.",
          "What is the Context API and when would you use it instead of Redux?",
        ],
      },
    },
  ],  "backend-engineer": [
    {
      title: "Database Design & Optimization",
      content: {
        overview:
          "Database interviews test your ability to design schemas, write efficient queries, and optimize performance. This chapter covers normalization, indexing, query planning, and trade-offs between SQL and NoSQL.",
        realLifeScenario:
          "A reporting dashboard query takes 45 seconds to load, timing out the request. The query joins 6 tables and filters by date range. You check the execution plan — full table scans on all tables, no indexes on the date column. You add a composite index on (date, customer_id) covering the filter and join columns. Query time drops to 200ms. You also create a materialized view that pre-aggregates daily totals, updated via a cron job. Dashboard now loads in under 100ms.",
        explanation:
          "Normalization (1NF-3NF) reduces redundancy but increases JOINs — denormalize for read-heavy workloads. Indexing: B-tree for range queries, hash for equality lookups, GiST for full-text search. Composite indexes: order matters — put high-selectivity columns first. Query planner: EXPLAIN ANALYZE shows actual execution time vs estimates. Connection pooling (PgBouncer, ProxySQL) prevents connection exhaustion. Read replicas handle read traffic but introduce replication lag. Partitioning splits large tables by date or key for faster scans.",
        keyPoints: [
          "EXPLAIN command: shows query plan, index usage, row estimates",
          "N+1 query problem: fetching related data in a loop instead of JOIN or batch",
          "Transaction isolation levels: Read Committed (default in PG), Repeatable Read, Serializable",
          "Index maintenance: write-heavy tables need fewer indexes to avoid slowdown",
          "Sharding: horizontal partitioning across databases — complexity in cross-shard queries",
        ],
        tips: [
          "Always measure before and after — 'premature optimization is the root of all evil'",
          "Design schema around query patterns, not just data relationships",
          "Understand your database's strengths: PostgreSQL for complex queries, MySQL for simple reads",
          "Backup and recovery strategy is a valid interview discussion",
        ],
      },
    },
    {
      title: "API Design & RESTful Services",
      content: {
        overview:
          "Well-designed APIs are intuitive, consistent, and evolvable. This chapter covers REST principles, versioning, error handling, pagination, and API security.",
        realLifeScenario:
          "Your team's API returns 500 errors without any useful message when validation fails. Frontend developers waste hours debugging. You redesign error responses to follow RFC 7807 (Problem Details), returning structured JSON with type, title, status, detail, and instance fields. Validation errors include a list of invalid fields. HTTP status codes are used correctly: 400 for bad requests, 401 for unauthenticated, 403 for unauthorized, 404 for not found, 409 for conflicts. The result: frontend teams resolve issues independently without asking backend.",
        explanation:
          "REST: resources identified by URIs, manipulated via HTTP methods. Versioning: URL-based (/v1/users), header-based (Accept: application/vnd.api+json;version=1), or query parameter — URL is simplest. Pagination: cursor-based is more reliable than offset-based for real-time data. Rate limiting: token bucket or sliding window, return Retry-After header. Authentication: JWT for stateless auth, OAuth2 for delegated authorization, API keys for machine-to-machine. Idempotency keys prevent duplicate processing — critical for payment APIs.",
        keyPoints: [
          "HTTP methods: GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove)",
          "Status codes: 2xx success, 3xx redirection, 4xx client error, 5xx server error",
          "HATEOAS: include links in responses so clients discover actions dynamically",
          "OpenAPI/Swagger: document API contract, generate client SDKs automatically",
          "WebSocket: upgrade from HTTP for real-time bidirectional communication",
        ],
        tips: [
          "Consistent naming: plural nouns, kebab-case for URIs, camelCase for JSON fields",
          "Don't expose internal implementation details in API responses",
          "Document breaking changes with migration guides and deprecation headers",
          "Use API gateways for authentication, rate limiting, and logging — keep services focused on business logic",
        ],
      },
    },
  ],
  "fullstack-engineer": [
    {
      title: "End-to-End Application Architecture",
      content: {
        overview:
          "Fullstack engineers bridge frontend and backend. This chapter covers how to architect applications that span the entire stack, from database to UI, with considerations for performance, security, and developer experience.",
        realLifeScenario:
          "You're building a real-time collaborative whiteboard application. Users draw on a canvas, and changes sync instantly to other users. Challenges: handling conflict resolution when two users draw simultaneously, rendering updates at 60fps, storing vector data efficiently, and supporting offline mode. You choose WebSocket for real-time sync, CRDTs (Conflict-free Replicated Data Types) for conflict resolution, Canvas API for rendering, and IndexedDB for offline local storage. The architecture spans: React frontend → WebSocket server → Redis pub/sub → PostgreSQL persistence.",
        explanation:
          "Fullstack architecture: frontend (React/Next.js) → API gateway → microservices (auth, whiteboard, storage) → data layer (cache + DB). Data flow: user action → optimistic UI update → API call → server validates and persists → broadcast to other clients. Security: HTTPS everywhere, CORS configured per-origin, input validation on both client and server, CSRF tokens for state-changing requests, Content Security Policy headers. Authentication: JWT with short expiration, refresh token rotation, secure httpOnly cookies. Performance: SSR for initial load, client-side hydration for interactivity, service workers for offline support.",
        keyPoints: [
          "Optimistic updates: show result immediately, revert on error — perceived performance",
          "WebSocket reconnection: exponential backoff with jitter prevents thundering herd",
          "Offline-first: service worker caches assets, IndexedDB stores application state",
          "Error boundary: catch React errors gracefully, show fallback UI",
          "Monitoring: Real User Monitoring (RUM) for frontend, APM for backend",
        ],
        tips: [
          "Think in systems, not features — how does each piece communicate and fail?",
          "Understand the full request lifecycle: browser → DNS → CDN → load balancer → server → DB",
          "Create architectural decision records (ADRs) to document trade-offs",
          "Build for observability from day one: logs, metrics, traces",
        ],
      },
    },
  ],
  "devops-engineer": [
    {
      title: "CI/CD & Automation",
      content: {
        overview:
          "Continuous Integration and Deployment pipelines are the backbone of modern software delivery. This chapter covers pipeline design, testing strategies, deployment patterns, and the shift-left philosophy.",
        realLifeScenario:
          "Your team deploys to production once a month because the manual release process is error-prone. Each release requires a 3-page checklist and two hours of manual testing. Production incidents are frequent. You implement CI/CD: every PR triggers linting, unit tests, integration tests, and security scanning. Merging to main builds a Docker image and deploys to staging. After staging validation, a one-click deployment promotes to production with canary releases. Time-to-production drops from 4 weeks to 4 hours. Deployment failures decrease by 90%.",
        explanation:
          "CI pipeline: code push → lint → build → unit tests → integration tests → security scan → artifact creation. CD pipeline: artifact → deploy to staging → integration tests → approval gate → canary deploy → full rollout → smoke tests. Tools: GitHub Actions/Jenkins for CI, ArgoCD/Flux for GitOps, Helm/Kustomize for Kubernetes manifests. Deployment strategies: rolling update (zero-downtime, gradual), blue-green (instant switch, double resources), canary (percentage-based, monitoring-driven), feature flags (decouple deploy from release).",
        keyPoints: [
          "Shift-left: move testing and security earlier in the pipeline",
          "Immutable infrastructure: never modify servers, always replace them",
          "GitOps: Git is the single source of truth, PRs are the change mechanism",
          "Trunk-based development: short-lived branches, merge frequently, feature flags",
          "Chaos engineering: intentionally inject failures to test system resilience",
        ],
        tips: [
          "Start with a simple pipeline, then add sophistication — don't over-engineer from day one",
          "Pipeline feedback should be fast: < 10 minutes for most teams",
          "Treat infrastructure as code: Terraform/AWS CDK for cloud resources",
          "Every deployment should be reversible — instant rollback capability is non-negotiable",
        ],
      },
    },
    {
      title: "Containerization & Orchestration",
      content: {
        overview:
          "Docker and Kubernetes have revolutionized how we deploy and manage applications. This chapter covers container concepts, orchestration patterns, and production Kubernetes best practices.",
        realLifeScenario:
          "Your microservices application runs on 20 bare-metal servers with manual deployment. Scaling requires provisioning new servers, taking days. You containerize each service and deploy to Kubernetes. Now, horizontal pod autoscaling handles traffic spikes automatically. A node failure causes Kubernetes to reschedule pods to healthy nodes within seconds. Resource requests and limits prevent noisy neighbors. But you face new challenges: pod startup order dependencies, distributed logging, and service mesh overhead for inter-service communication.",
        explanation:
          "Docker: images are layered filesystems — each instruction creates a layer, enabling caching and smaller transfers. Kubernetes: control plane (API server, scheduler, controller manager, etcd) manages worker nodes. Pods are the smallest deployable unit. Deployments manage replica sets for rolling updates. Services provide stable networking (ClusterIP for internal, NodePort for external, LoadBalancer for cloud). ConfigMaps and Secrets decouple configuration from images. Namespaces provide isolation. Resource quotas prevent teams from exhausting cluster resources.",
        keyPoints: [
          "Dockerfile optimization: multi-stage builds, .dockerignore, minimal base images (distroless)",
          "Pod lifecycle: Pending → Running → Succeeded/Failed — probes (liveness, readiness, startup)",
          "Persistent volumes: PV (cluster storage) → PVC (pod request) → StorageClass (dynamic provisioning)",
          "Helm: package manager for Kubernetes, charts templatize Kubernetes manifests",
          "Service mesh (Istio/Linkerd): mTLS, traffic splitting, circuit breaking, observability",
        ],
        tips: [
          "12-factor app methodology applies to containerized applications",
          "Don't put a database in Kubernetes — stateful sets are complex, use managed DB services",
          "Monitoring: kube-prometheus-stack (Prometheus + Grafana), metrics-server for HPA",
          "Resource limits protect the cluster — always set CPU/memory requests and limits",
        ],
      },
    },
  ],
  "qa-engineer": [
    {
      title: "Testing Strategies & Methodologies",
      content: {
        overview:
          "Testing is more than writing test cases — it's a strategic discipline. This chapter covers test planning, risk-based testing, exploratory testing, and building a testing culture.",
        realLifeScenario:
          "Your team ships a new feature that breaks an existing checkout flow in production. The feature had extensive unit tests (90% coverage) but no integration tests. The bug was in the interaction between the new discount service and the existing payment service — something unit tests couldn't catch. You introduce integration contract tests (Pact) between services and add E2E tests for critical user paths. The testing pyramid shifts: fewer unit tests, more integration contracts, critical E2E paths. Bug escape rate drops by 70%.",
        explanation:
          "Test pyramid: unit tests (fast, many) → integration tests (medium, moderate) → E2E tests (slow, few). Risk-based testing: prioritize test scenarios by business impact × failure probability. Exploratory testing: simultaneous learning, test design, and execution — session-based with charters. Test coverage: line coverage ≠ quality — mutation testing (changing code to verify test catches it) gives stronger signal. Behavior-driven development (BDD): Given-When-Then scenarios bridge business and technical language. Test documentation: test plans, test cases, bug reports with reproduction steps and severity.",
        keyPoints: [
          "Equivalence partitioning: divide inputs into groups that should behave identically",
          "Boundary value analysis: test at edges, because bugs cluster at boundaries",
          "Pairwise testing: test combinations efficiently — reduces test count exponentially",
          "Static testing: code reviews, walkthroughs, linting — finds bugs before execution",
          "Dynamic testing: execute code with specific inputs and verify outputs",
        ],
        tips: [
          "Automate what's repetitive, keep exploratory manual — automation has diminishing returns",
          "Test in production: feature flags, canary releases, synthetic monitoring",
          "Bug triage: classify by severity (crash, major, minor) and priority (urgent, high, medium, low)",
          "Build quality in, don't inspect it in — prevention is cheaper than detection",
        ],
      },
    },
    {
      title: "Automation Frameworks & Tools",
      content: {
        overview:
          "Test automation frameworks must be maintainable, reliable, and scalable. This chapter covers framework design, element locators, wait strategies, and CI integration.",
        realLifeScenario:
          "Your Selenium tests fail randomly — sometimes they pass, sometimes they break. The issue: tests use Thread.sleep for waits, which is timing-dependent. On slow CI runners, elements aren't ready. You refactor to use explicit waits (WebDriverWait with expected conditions), implement the Page Object Model, and add retry logic for flaky tests. Failure rate drops from 30% to 2%. The remaining 2% are real bugs. Your test suite now provides reliable signal instead of noise.",
        explanation:
          "Framework components: test runner (Jest, Playwright, pytest), assertion library (Chai, JUnit), reporting (Allure, ReportPortal), configuration management (environment-specific configs). Page Object Model: each page/screen is a class with elements (locators) and actions (methods). Locator strategy: data-testid attributes are most reliable — CSS selectors second, XPath last (fragile). Wait strategies: explicit waits (wait for specific condition) over implicit waits (global timeout). CI integration: run tests in parallel with sharding, use Docker for consistent environments, retry flaky tests with backoff.",
        keyPoints: [
          "Playwright vs Selenium: Playwright is faster, has auto-wait, and supports multiple browsers natively",
          "API testing: test faster than UI tests, use for backend validation before UI automation",
          "Visual testing: screenshot comparison catches unintended UI changes",
          "Data-driven testing: separate test logic from test data for reusability",
          "Parallel execution: run tests in CI worker shards — reduces suite time from hours to minutes",
        ],
        tips: [
          "Don't automate everything — 80% automation is the sweet spot",
          "Flaky tests destroy trust — investigate and fix or delete them immediately",
          "Record test execution video for debugging failed CI runs",
          "Mobile testing: Appium for cross-platform, Detox for React Native, Espresso for Android native",
        ],
      },
    },
  ],
};
