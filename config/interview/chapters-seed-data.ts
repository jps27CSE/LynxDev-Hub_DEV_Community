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
          "What is the difference between an array and a linked list?",
          "Explain the concept of Big O notation.",
          "Explain how a hash table works.",
          "What is the difference between a stack and a queue?",
          "What is the difference between a binary tree and a binary search tree?",
          "Explain how quicksort works and its time complexity.",
          "What is binary search and when would you use it?",
          "What is the difference between breadth-first search and depth-first search?",
          "Explain the concept of recursion and give an example.",
          "What is the difference between a min-heap and a max-heap?",
          "How does merge sort work and what is its time complexity?",
          "What is the difference between an adjacency list and an adjacency matrix?",
          "Explain what a balanced binary search tree is and why it matters.",
          "What is the difference between linear search and binary search?",
          "What are circular buffers and when would you use them?",
          "What is the difference between a static array and a dynamic array?",
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
          "Describe the differences between REST and GraphQL.",
          "What is the difference between monolithic and microservices architecture?",
          "What is the difference between SQL and NoSQL databases?",
          "What is load balancing and why is it important?",
          "Explain the CAP theorem.",
          "What is caching and why is it important?",
          "What is the difference between horizontal and vertical scaling?",
          "What is a CDN and how does it improve performance?",
          "Explain what a message queue is and when would you use one.",
          "What is the difference between stateful and stateless architecture?",
          "What is sharding and how does it help with database scalability?",
          "Explain the concept of idempotency in API design.",
          "What is a microservice and what are its advantages and disadvantages?",
          "What is the difference between synchronous and asynchronous communication in distributed systems?",
          "Explain the concept of rate limiting and common algorithms used.",
          "What is database indexing and how does it improve query performance?",
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
          "What is polymorphism in OOP?",
          "What is dependency injection and why use it?",
          "What is the difference between an interface and an abstract class in Java?",
          "What are the SOLID principles in object-oriented design?",
          "What is encapsulation and why is it important?",
          "Explain the difference between inheritance and composition.",
          "What is the difference between method overloading and method overriding?",
          "Explain the Singleton pattern and when would you use it.",
          "What is the Factory pattern and what problem does it solve?",
          "Explain the Observer pattern with a real-world example.",
          "What is the difference between a class and an object?",
          "What is abstraction in OOP and how do you achieve it?",
          "Explain the Strategy pattern and when would you use it.",
          "What is the Decorator pattern and how does it work?",
          "What is the difference between tight coupling and loose coupling?",
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
          "What is the difference between processes and threads?",
          "Explain the concept of deadlock and its necessary conditions.",
          "What is the difference between a mutex and a semaphore?",
          "What is virtual memory and why do we need it?",
          "What is the difference between preemptive and non-preemptive scheduling?",
          "Explain the concept of a race condition and how to prevent it.",
          "What is the difference between concurrency and parallelism?",
          "Explain the producer-consumer problem and how to solve it.",
          "What is the difference between a process and a program?",
          "What is context switching and what causes overhead?",
          "Explain the concept of thrashing in operating systems.",
          "What is the difference between kernel mode and user mode?",
          "Explain the readers-writers problem and its solutions.",
          "What is spooling and how does it work?",
          "What is the difference between paging and segmentation?",
          "Explain the concept of a system call and give examples.",
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
          "What is the difference between TCP and UDP?",
          "What is the difference between HTTP and HTTPS? — explain TLS handshake and certificate validation",
          "What is DNS and how does it work?",
          "What is the client-server model and how does it work?",
          "Explain the OSI model and its seven layers.",
          "What is the difference between IPv4 and IPv6?",
          "Explain the three-way handshake in TCP.",
          "What is a subnet mask and how does it work?",
          "What is the difference between a MAC address and an IP address?",
          "Explain what happens during a TLS handshake.",
          "What is the difference between HTTP/1.1 and HTTP/2?",
          "What is a proxy server and how does it work?",
          "What is the difference between symmetric and asymmetric encryption?",
          "What is a firewall and what types of firewalls exist?",
          "What is the difference between a hub, a switch, and a router?",
          "Explain the concept of a port number and list common ports.",
        ],
      },
    },
    {
      title: "Problem-Solving & Coding Strategies",
      content: {
        overview:
          "Technical interviews test not just what you know, but how you think. This chapter covers structured problem-solving frameworks, time/space complexity analysis, common coding patterns, and communication strategies that help you tackle any algorithm problem with confidence.",
        realLifeScenario:
          "You're in an interview and the interviewer asks: 'Design an algorithm to find the k most frequent elements in an array.' Instead of jumping into code, you pause, restate the problem, ask clarifying questions about input size and constraints, then walk through three approaches: sorting (O(n log n)), min-heap (O(n log k)), and bucket sort (O(n)). You analyze trade-offs, implement the heap solution, test with a sample case, and discuss edge cases (empty array, k=0, duplicate frequencies). The interviewer sees your structured thinking, not just your coding speed.",
        explanation: `## The Problem-Solving Framework

Every coding interview problem can be solved with a repeatable framework:

1. **Clarify** — Restate the problem in your own words. Ask about input size, constraints, edge cases, and expected output format. Never assume.

2. **Think out loud** — Describe your initial brute-force approach, even if it's naive. This shows you can iterate. Say: "A naive solution would be... which gives us O(X) time complexity."

3. **Optimize** — Walk through optimizations step by step. Identify bottlenecks in the brute force. Consider alternative data structures (hash map, heap, trie) or algorithms (two pointers, sliding window, binary search).

4. **Write clean code** — Use meaningful variable names, handle edge cases first (empty input, null values), and write modular code with helper functions.

5. **Test** — Walk through your code with a concrete example. Check edge cases. Trace through to catch off-by-one errors.

6. **Analyze** — State the final time and space complexity. Discuss trade-offs and alternative approaches.

\`\`\`javascript
// Example: Two Sum problem walkthrough
function twoSum(nums, target) {
  // Brute force: O(n²) — nested loops
  // Optimized: O(n) using hash map

  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return []; // No solution
}
\`\`\`

## Common Coding Patterns

- **Sliding Window** — Contiguous subarray/substring problems (max sum, longest substring)
- **Two Pointers** — Sorted array problems, palindrome checking, pair sum
- **Fast & Slow Pointers** — Cycle detection in linked lists, middle of linked list
- **Merge Intervals** — Overlapping interval problems
- **Cyclic Sort** — Problems where numbers are in range [1, n]
- **In-place Reversal** — Reverse linked list, reverse sub-list
- **BFS / DFS** — Tree and graph traversal, shortest path, connected components
- **Binary Search** — Search in sorted arrays, rotated arrays, finding boundaries

## Time Complexity Reference

| Pattern | Time | Space |
|---------|------|-------|
| Brute force nested loops | O(n²) | O(1) |
| Hash map / set | O(n) avg | O(n) |
| Two pointers (sorted) | O(n) | O(1) |
| Binary search | O(log n) | O(1) |
| BFS/DFS (tree) | O(n) | O(n) |
| BFS (graph) | O(V+E) | O(V) |
| Sliding window | O(n) | O(1) or O(k) |`,
        keyPoints: [
          "Restate the problem and ask clarifying questions before writing any code — it shows you're thorough, not slow",
          "Start with brute force, then optimize — interviewers want to see your reasoning process, not just the final solution",
          "Name your variables clearly and write modular code — readability matters as much as correctness",
          "Test your code with a concrete example and edge cases — empty input, single element, duplicates, negative numbers",
          "State time and space complexity explicitly after implementing — it's a required part of the answer",
        ],
        tips: [
          "Practice on a whiteboard or plain text editor — no syntax highlighting or autocomplete",
          "Use the 'five whys' technique: keep asking 'why' until you understand the core of the problem",
          "If stuck, try a different approach: draw a diagram, try a small example, or start from the output",
          "Communicate constantly: tell the interviewer what you're thinking, even if you're not sure it'll work",
          "Don't give up — partial solutions show more than giving up and asking for the answer",
        ],
        sampleQuestions: [
          "Given an array of integers, find two numbers that add up to a target — walk through brute force → hash map optimization",
          "Find the longest substring without repeating characters — sliding window approach with character tracking",
          "Merge two sorted arrays — two-pointer technique with O(n) time and O(1) extra space",
          "Determine if a string is a palindrome — two pointers from both ends, handling alphanumeric characters only",
          "Find the maximum subarray sum (Kadane's algorithm) — explain the optimal O(n) approach",
        ],
      },
    },
    {
      title: "Behavioral & Soft Skills",
      content: {
        overview:
          "Behavioral questions evaluate your teamwork, leadership, conflict resolution, and cultural fit. This chapter covers the STAR method, common behavioral questions, how to structure your responses, and strategies for demonstrating your soft skills effectively.",
        realLifeScenario:
          "The interviewer asks: 'Tell me about a time you had a conflict with a teammate.' You freeze because you prepared only technical questions. Instead, use STAR: Situation (we disagreed on the database schema for a new feature), Task (I needed to resolve the disagreement without damaging the relationship), Action (I scheduled a meeting, listened to their concerns, proposed a compromise with a pros/cons comparison), Result (we chose a hybrid approach that satisfied both requirements, and the feature shipped on time). The interviewer learns you can handle disagreement professionally.",
        explanation: `## The STAR Method

STAR is the universal framework for behavioral questions:

- **Situation** — Set the context. When and where did this happen? (1-2 sentences)
- **Task** — What was your responsibility or goal? (1 sentence)
- **Action** — What specific steps did YOU take? Use "I" not "we". (3-4 sentences — this is the bulk of your answer)
- **Result** — What happened? Use concrete numbers or outcomes. (1-2 sentences)

\`\`\`
Q: "Tell me about a time you fixed a difficult bug."

S: "In my internship, the production API was returning 502 errors for 10% of requests."
T: "I was responsible for identifying and fixing the root cause before the weekly release."
A: "I reproduced the issue locally, added structured logging to trace the failing path, isolated it to a race condition in the cache layer, and implemented a mutex guard."
R: "The fix eliminated 502 errors entirely, and I documented the root cause in our incident post-mortem."
\`\`\`

## Common Behavioral Questions

Prepare stories for each category:

**Teamwork & Collaboration**
- Tell me about a time you worked in a team to achieve a goal.
- Describe a situation where you had to collaborate with someone difficult.
- How do you handle disagreements with teammates?

**Failure & Mistakes**
- Tell me about a time you made a mistake. What did you learn?
- Describe a project that failed and what you would do differently.
- Tell me about a time you missed a deadline.

**Leadership & Initiative**
- Describe a time you took the lead on a project.
- Tell me about a time you went above and beyond.
- Describe an idea you proposed that was implemented.

**Conflict Resolution**
- Tell me about a conflict you had with a colleague.
- How do you handle receiving critical feedback?
- Describe a time you had to give difficult feedback to someone.

**Learning & Growth**
- Tell me about a time you learned a new technology quickly.
- Describe a skill you are currently developing.
- How do you stay updated with industry trends?

## Tips for Behavioral Interviews

- Prepare 5-7 stories that cover different categories (leadership, failure, conflict, achievement)
- Each story should be 60-90 seconds when spoken
- Quantify results when possible: "reduced load time by 40%", "served 10,000 users"
- Be honest — interviewers can tell when you're fabricating stories
- Practice your stories out loud, but don't memorize them verbatim — sound natural`,
        keyPoints: [
          "Use STAR (Situation, Task, Action, Result) for every behavioral answer — it provides structure and completeness",
          "Prepare 5-7 versatile stories that can be adapted to different questions — cover conflict, failure, leadership, achievement",
          "Quantify your impact with numbers — 'reduced by 40%', 'handled 10K requests', 'shipped 2 weeks early'",
          "Be honest about failures — owning mistakes and explaining what you learned is a strength, not a weakness",
          "Show growth: connect past experiences to how they make you a better engineer today",
        ],
        tips: [
          "Record yourself answering behavioral questions and listen for filler words (um, like, you know)",
          "Keep answers to 90 seconds max — if the interviewer wants more details, they'll ask follow-ups",
          "Research the company's values before the interview and align your stories with them",
          "Have questions ready for the interviewer — it shows genuine interest and engagement",
          "Send a thank-you email within 24 hours mentioning something specific from the conversation",
        ],
        sampleQuestions: [
          "Tell me about a time you had a conflict with a teammate — use STAR to describe the resolution process",
          "Describe a project that failed and what you learned from it — focus on the lesson, not the blame",
          "Tell me about a time you went above and beyond what was expected — quantify the impact",
          "How do you handle receiving critical feedback? — show growth mindset with a concrete example",
          "Describe a time you had to learn a new technology quickly — demonstrate your learning process",
        ],
      },
    },
    {
      title: "Version Control & Git",
      content: {
        overview:
          "Git is the industry standard for version control. This chapter covers git fundamentals, branching strategies, collaboration workflows, common commands, and best practices for code review and commit hygiene.",
        realLifeScenario:
          "You accidentally committed sensitive credentials to the main branch. Your teammates have already pulled your changes. You need to remove the credentials from git history without disrupting everyone's work. You use git reset to undo the commit, then git push --force-with-lease to update the remote. You tell teammates to rebase their branches. Then you add the credentials file to .gitignore and set up a pre-commit hook to scan for secrets. This scenario demonstrates understanding of git internals and professional cleanup practices.",
        explanation: `## Git Fundamentals

Git stores snapshots of your project as a directed acyclic graph (DAG) of commits. Each commit points to its parent(s) and contains a tree object (file structure) and metadata (author, message, timestamp).

\`\`\`bash
# Basic workflow
git init                  # Initialize a repository
git add .                 # Stage changes
git commit -m "message"   # Commit staged changes
git status                # Check working tree status
git log --oneline         # View commit history
\`\`\`

## Branching Strategies

**Git Flow** — Main branch + develop + feature/hotfix/release branches. Structured but heavy. Best for release-cycle projects.

**GitHub Flow** — Main branch + feature branches. Simple, continuous deployment. Every branch is a pull request. Best for web applications.

**Trunk-Based Development** — Short-lived feature branches merged frequently to main. Less than a day old. Requires CI with feature flags. Best for CI/CD teams.

\`\`\`bash
# Feature branch workflow
git checkout -b feature/login-page  # Create and switch to feature branch
git add -A                          # Stage all files
git commit -m "Add login form UI"   # Commit with descriptive message
git push -u origin feature/login-page  # Push to remote
\`\`\`

## Merge vs Rebase vs Squash

- **Merge** — Preserves full history, creates a merge commit. Safe, non-destructive.
- **Rebase** — Rewrites history, linear commit log. Clean but can lose context. Never rebase shared branches.
- **Squash** — Combines multiple commits into one. Clean history but loses granular changes.

## Code Review Best Practices

- Keep PRs small (under 400 lines) — they get 2x more thorough reviews
- Write descriptive PR titles and include screenshots for UI changes
- Review for logic, not style — use linters for formatting
- Be constructive in comments: "What about..." instead of "This is wrong"
- Respond to reviews within 24 hours

## Common Git Commands

\`\`\`bash
# Undoing changes
git restore <file>              # Discard unstaged changes
git restore --staged <file>     # Unstage a file
git reset HEAD~1                # Undo last commit (keep changes)
git reset --hard HEAD~1         # Undo last commit (discard changes)

# Collaboration
git fetch origin                # Download remote changes
git pull --rebase               # Fetch + rebase (cleaner than merge)
git push --force-with-lease     # Force push safely (don't use --force)

# Debugging
git blame <file>                # Who changed what and when
git bisect                      # Binary search for the commit that introduced a bug
git reflog                      # View all HEAD movements (safety net)
\`\`\``,
        keyPoints: [
          "Git stores commits as a DAG — understanding this mental model helps with advanced operations",
          "Choose a branching strategy that matches your team's release cycle — GitHub Flow is simplest for most teams",
          "Write descriptive commit messages: 'Fix login redirect bug' not 'fix stuff'",
          "Keep PRs small (<400 lines) and respond to code reviews within 24 hours",
          "Use .gitignore to exclude sensitive files, dependencies, and build artifacts from version control",
        ],
        tips: [
          "Master git reflog — it's your safety net for recovering lost commits",
          "Use git rebase -i to clean up commits before pushing — squash fixup commits together",
          "Never force push to shared branches — use --force-with-lease as a safer alternative",
          "Set up git hooks (pre-commit, pre-push) to automate linting, testing, and secret scanning",
          "Learn git stash — useful for switching contexts without losing work-in-progress",
        ],
        sampleQuestions: [
          "What is the difference between git merge and git rebase? — explain when to use each",
          "How do you resolve a merge conflict? — walk through the process step by step",
          "What is the difference between git reset, git revert, and git restore?",
          "Explain a branching strategy you have used — describe the workflow and its trade-offs",
          "How do you remove a file from git history that contains sensitive information?",
        ],
      },
    },
    {
      title: "Web Fundamentals",
      content: {
        overview:
          "Understanding how the web works at a fundamental level — HTTP, DNS, browsers, and the request-response cycle — is essential for every software engineer. This chapter covers the core web platform concepts that all developers should know regardless of specialization.",
        realLifeScenario:
          "Your web application loads slowly for users in different geographic regions. You discover that unoptimized images, too many HTTP requests, and no CDN are the culprits. By understanding HTTP/2 multiplexing, browser caching (Cache-Control headers), DNS preconnect hints, and CDN edge caching, you reduce load time from 8 seconds to 1.2 seconds. This demonstrates why every engineer — not just frontend specialists — needs web fundamentals.",
        explanation: `## The Request-Response Cycle

When you type a URL and press Enter:

1. **DNS Resolution** — Browser checks its cache, then OS cache, then queries a recursive DNS resolver to find the IP address
2. **TCP Handshake** — Three-way handshake (SYN → SYN-ACK → ACK) establishes a connection to the server
3. **TLS Negotiation** — If HTTPS, a TLS handshake negotiates encryption (certificate verification, key exchange)
4. **HTTP Request** — Browser sends an HTTP request (GET, POST, etc.) with headers
5. **Server Processing** — Server processes the request (routing, database queries, business logic)
6. **HTTP Response** — Server sends back a response with status code, headers, and body
7. **Browser Rendering** — Browser parses HTML, builds DOM, downloads CSS/JS/images, renders the page

## HTTP Methods and Status Codes

**Common methods:** GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)

**Status code categories:**
- 1xx — Informational (101 Switching Protocols for WebSocket upgrade)
- 2xx — Success (200 OK, 201 Created, 204 No Content)
- 3xx — Redirection (301 Moved Permanently, 302 Found, 304 Not Modified)
- 4xx — Client Error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Rate Limited)
- 5xx — Server Error (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable)

## Key Headers

\`\`\`
# Caching
Cache-Control: public, max-age=3600, immutable
ETag: "abc123"
Last-Modified: Tue, 15 Feb 2025 08:00:00 GMT

# Security
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff

# CORS (Cross-Origin Resource Sharing)
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST
\`\`\`

## Browser Storage

| Storage | Capacity | Persistence | Access |
|---------|----------|-------------|--------|
| Cookies | 4KB | Per domain, can set expiry | Sent with every request |
| localStorage | ~5MB | Until manually cleared | Synchronous, tab-shared |
| sessionStorage | ~5MB | Until tab closes | Synchronous, tab-isolated |
| IndexedDB | Unlimited (disk) | Until manually cleared | Asynchronous |

## Core Web Vitals

- **LCP (Largest Contentful Paint)** — Loading performance, target < 2.5s
- **FID (First Input Delay)** — Interactivity, target < 100ms
- **CLS (Cumulative Layout Shift)** — Visual stability, target < 0.1`,
        keyPoints: [
          "The full request cycle: DNS → TCP → TLS → HTTP → Server → Response → Render — understand each step",
          "HTTP is stateless — each request is independent; use cookies, tokens, or session IDs for state",
          "HTTPS encrypts all data in transit via TLS — never use plain HTTP for production applications",
          "CORS is a browser security mechanism — servers must explicitly allow cross-origin requests",
          "Browser storage has different trade-offs: cookies for auth, localStorage for preferences, IndexedDB for large data",
        ],
        tips: [
          "Use browser DevTools Network tab to inspect every request — headers, timing, size, and waterfall",
          "Understand the Same-Origin Policy — it's the foundation of web security",
          "Know the difference between 301 (permanent) and 302 (temporary) redirects and their caching behavior",
          "Cache-Control headers are the most effective performance optimization — use them correctly",
          "Preconnect and prefetch hints can improve perceived performance by resolving DNS and establishing connections early",
        ],
        sampleQuestions: [
          "What happens when you type a URL in a browser and press Enter? — explain the full flow step by step",
          "What is the difference between HTTP and HTTPS? — explain TLS handshake and certificate validation",
          "Explain the difference between 301 and 302 redirects — when would you use each?",
          "What is CORS and why do we need it? — explain the preflight request and how servers enable cross-origin access",
          "What are the Core Web Vitals and why are they important for user experience?",
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
          "What is the difference between DOMContentLoaded and the load event?",
          "What is requestAnimationFrame and why is it used for animations?",
          "What is an AbortController and how do you cancel a fetch request?",
          "What is the Geolocation API and how do you use it?",
          "What is the Clipboard API and how do you copy text to the clipboard?",
          "What is the IntersectionObserver API and what is it used for?",
          "What are Server-Sent Events (SSE) and how do they differ from WebSockets?",
        ],
      },
    },
    {
      title: "React & Modern Frameworks",
      content: {
        overview:
          "React is the most demanded frontend library in the industry. This chapter covers the full React ecosystem: hooks, state management, performance optimization, React 19 features (Actions, Server Components, Compiler), testing, and patterns like composition and render props.",
        realLifeScenario:
          "A social media feed component re-renders the entire list when a single post gets a new like. Users on mid-range phones experience janky scrolling. You identify the issue: the parent component creates a new array reference on every render, causing all child Post components to re-render. Solutions: use React.memo with stable props, extract the list into a separate component with its own state, or virtualize with react-window. The result: scroll performance improves from 15fps to 60fps.",
        explanation:
          "React's component model is built on props (immutable inputs), state (mutable internal data), and the virtual DOM. Hooks: useState for local state, useEffect for side effects, useMemo/useCallback for memoization, useRef for DOM access and mutable refs, useContext for consuming context, useReducer for complex state. React 19 introduces: use() for reading promises/context in render, useActionState and useFormStatus for form handling, useOptimistic for optimistic UI, and the React Compiler for automatic memoization. Performance optimization: React.memo prevents unnecessary re-renders, code splitting with React.lazy + Suspense reduces bundle size, virtualization handles large lists. Testing with React Testing Library focuses on behavior over implementation.",
        keyPoints: [
          "useState for local component state, useReducer for complex state logic with multiple sub-values",
          "useEffect handles side effects with cleanup — dependency array controls when it re-runs",
          "useMemo/useCallback prevent wasted re-renders by stabilizing values and function references",
          "React 19: use() suspends rendering until a promise resolves — integrates with Suspense natively",
          "React 19 Actions: form action prop, useActionState, useFormStatus, useOptimistic reduce form boilerplate",
          "React Compiler auto-memoizes at build time — no more manual useMemo/useCallback",
          "Reconciliation: key props are critical for correct list rendering and performance",
          "Lifting state up keeps components synchronized via a common ancestor",
          "Context API avoids prop drilling for global concerns; pair with useReducer for complex state",
        ],
        tips: [
          "Profile with React DevTools before optimizing — don't memoize prematurely",
          "Prefer composition over inheritance: children prop, render props, and custom hooks share logic without wrapper hell",
          "Test by behavior, not implementation — use getByRole, findByText, userEvent from React Testing Library",
          "React.memo is a leaf-component optimization — wrapping every component hurts more than it helps",
          "Understand concurrent features (useTransition, useDeferredValue) for keeping UIs responsive under heavy updates",
        ],
        sampleQuestions: [
          "What is React and how does it differ from other JavaScript frameworks?",
          "Explain the Virtual DOM and how React uses it for performance.",
          "What is JSX and why is it used in React?",
          "Difference between functional and class components.",
          "What are props and how do they differ from state?",
          "Explain the useState hook with an example.",
          "How does useEffect work? What is the cleanup function?",
          "What is the difference between useMemo and useCallback?",
          "Explain useRef and its common use cases.",
          "How does useContext work and when should you use it?",
          "What is useReducer and when is it better than useState?",
          "What are custom hooks? Write an example.",
          "Explain React reconciliation and the key prop.",
          "How does React handle events? What are synthetic events?",
          "Controlled vs uncontrolled components -- difference and use cases.",
          "What are React Server Components (RSC)?",
          "Explain the use() hook in React 19.",
          "What is useActionState and how does it simplify forms?",
          "How does the React Compiler (React Forget) work?",
          "What are React 19 Actions?",
          "How do you optimize React performance?",
          "What are Error Boundaries and how do you create one?",
          "Explain React Context API -- when is it appropriate vs prop drilling?",
          "How does React Router work?",
          "Composition vs inheritance in React.",
          "What are Higher-Order Components (HOCs) and Render Props?",
          "What is the difference between useEffect and useLayoutEffect?",
          "What are Pure Components in React?",
          "Explain React.memo and when should you use it?",
          "What is the StrictMode component in React?",
          "Explain the concept of lifting state up in React.",
          "What are keys in React and why are they important?",
          "What is the difference between Shadow DOM and Virtual DOM?",
          "How do you handle forms in React 19 vs earlier versions?",
          "What is Suspense in React?",
          "Explain code splitting in React with React.lazy and Suspense.",
          "What are React Portals and when would you use them?",
          "What is the difference between React and ReactDOM?",
          "How does React's batching mechanism work?",
          "What is the useDeferredValue hook?",
          "What is the useTransition hook?",
          "Explain the concept of render props in React.",
          "What is the children prop in React?",
          "How do you handle side effects in React?",
          "What is the purpose of the useId hook?",
          "Explain the difference between server-side rendering (SSR) and client-side rendering (CSR).",
          "What is hydration in React?",
          "How do you test React components?",
          "What is the role of the ref prop in React?",
          "What is forwardRef in React?",
          "Explain React Fiber architecture.",
          "What is the useOptimistic hook?",
          "What is the useFormStatus hook?",
        ],
      },
    },
    {
      title: "Angular Deep Dive",
      content: {
        overview:
          "Angular is a TypeScript-based framework by Google for building dynamic, enterprise-grade SPAs. This chapter covers components, templates, DI, services, routing, forms, RxJS, Signals, standalone components, change detection, SSR, testing, and advanced patterns like custom form controls and deferrable views.",
        realLifeScenario:
          "A large enterprise dashboard app built with Angular loads 10 seconds on initial visit because every feature module is eagerly loaded. The bundle contains hundreds of components, even those rarely used. You implement route-level lazy loading with loadChildren, convert shared dependencies to standalone components, and add @defer blocks for heavy chart components. You also switch to OnPush change detection and add trackBy to all ngFor lists. The result: initial bundle drops from 4.2MB to 890KB, Time to Interactive falls to 2.1 seconds, and runtime performance improves 3x.",
        explanation:
          "Angular's component model: @Component decorator with selector, template, styles. Data binding: interpolation { }, property binding [ ], event binding ( ), two-way binding [(ngModel)]. Structural directives (*ngIf, *ngFor, *ngSwitch) control DOM layout. Attribute directives (ngClass, ngStyle) modify appearance. Services encapsulate business logic and are injected via the DI system. The HttpClient module handles API calls with typed responses and interceptors. Routing enables SPA navigation with lazy loading, guards, resolvers, and preloading strategies. Reactive forms provide robust validation with custom validators and async validation. RxJS powers async workflows with Observables, operators (debounceTime, switchMap, catchError), and the async pipe. Angular Signals (v16+) offer a simpler reactive primitive for synchronous state. Standalone components (v14+) replace NgModules for cleaner architecture. Change detection can be optimized with OnPush strategy. SSR via Angular Universal improves SEO and initial load. Zoneless change detection (v18+) removes zone.js dependency.",
        keyPoints: [
          "@Component decorator with selector, template, styles — defines a view",
          "Data binding: { interpolation }, [property], (event), [(ngModel)]",
          "Structural directives: *ngIf, *ngFor, *ngSwitch — add/remove DOM elements",
          "Dependency Injection: @Injectable with providedIn: 'root' for tree-shakeable singletons",
          "HttpClient with typed responses, interceptors for auth/logging/error handling",
          "Router: lazy loading via loadChildren, guards (CanActivate), resolvers for pre-fetching",
          "Reactive Forms: FormGroup, FormControl, validators, custom async validation",
          "RxJS: Observables, operators (debounceTime, switchMap, catchError), async pipe",
          "Angular Signals: signal(), computed(), effect() — synchronous reactive state",
          "Standalone components: standalone: true, imports array — no NgModule needed",
          "ChangeDetectionStrategy.OnPush: checks only on @Input change or event — better performance",
          "@defer block: deferrable views for lazy-loading heavy components",
          "Angular Universal: SSR via @nguniversal/express-engine for SEO and initial load",
          "Zoneless change detection: v18+ opt-in, removes zone.js for smaller/faster apps",
        ],
        tips: [
          "Use OnPush change detection + signals for best performance in large apps",
          "Always unsubscribe from Observables — use async pipe or takeUntil pattern",
          "Prefer standalone components for new projects — NgModules are legacy",
          "Use trackBy in *ngFor for list optimization — prevents full re-render on update",
          "Lazy load everything deferrable: routes, heavy components, large modules",
          "Test components via TestBed + ComponentFixture; test services with HttpClientTestingModule",
          "Use inject() function instead of constructor DI for cleaner functional patterns",
        ],
        sampleQuestions: [
          "What is Angular and how is it different from AngularJS?",
          "Explain the architecture of an Angular application.",
          "What are the main building blocks of Angular?",
          "What is a component in Angular and how do you create one?",
          "Explain data binding in Angular.",
          "What are structural directives in Angular?",
          "What are attribute directives in Angular?",
          "Explain Dependency Injection in Angular.",
          "What are services in Angular and why are they used?",
          "How does Angular HttpClient work?",
          "Explain Angular Router and lazy loading.",
          "What are route guards in Angular?",
          "Template-driven vs Reactive forms in Angular.",
          "How do you implement form validation in Angular?",
          "What are pipes in Angular? Give examples.",
          "How do you use RxJS Observables in Angular?",
          "What are Angular Signals and how do they differ from RxJS?",
          "What are standalone components in Angular?",
          "Explain Angular's change detection strategy (Default vs OnPush).",
          "What is Angular Universal and how does SSR work?",
          "How do you test Angular components and services?",
          "What is the Angular CLI and what commands are commonly used?",
          "Explain the Angular component lifecycle hooks.",
          "What are Angular resolvers and how do they work?",
          "What is the difference between `ngModel` and `formControl`?",
          "What are Angular Interceptors and how do you create one?",
          "What are Angular Directives? Explain the three types.",
          "How does Angular handle error handling in HTTP requests?",
          "What is lazy loading in Angular and how do you implement it?",
          "What is content projection in Angular and how does `<ng-content>` work?",
          "What is the `@ViewChild` and `@ViewChildren` decorator?",
          "What is `@ContentChild` and how is it different from `@ViewChild`?",
          "Explain the `async` pipe in Angular.",
          "What are Angular element references (`#ref`) and template reference variables?",
          "What is the purpose of `trackBy` in `*ngFor`?",
          "What is `ng-container` and when would you use it?",
          "What is zoneless change detection in Angular?",
          "What are Angular decorators and list common ones.",
          "What is the difference between `providedIn: 'root'` and registering in `NgModule.providers`?",
          "What is the Angular `@HostBinding` and `@HostListener` decorator?",
          "What are Angular environments and how do you manage configuration?",
          "What is the `ng-template` directive and how does it work?",
          "What are Angular guards and how are they different from resolvers?",
          "What is `ngZone` and when would you use it?",
          "What is the Angular `Renderer2` and when would you use it?",
          "What is the `HttpContext` and `HttpContextToken` in Angular?",
          "How do you create a custom form control in Angular?",
          "What is the `inject()` function in Angular?",
          "What are Angular animations and how do you use them?",
          "Explain Angular's `@defer` block (deferrable views).",
        ],
      },
    },
    {
      title: "State Management",
      content: {
        overview:
          "State management is a critical skill for frontend engineers building complex applications. This chapter covers Redux, Redux Toolkit, Zustand, Jotai, Valtio, NgRx, Context API, server state management (React Query, SWR), and patterns like selectors, middleware, normalization, and undo/redo.",
        realLifeScenario:
          "Your team's React app has 50+ components sharing user authentication, theme preference, shopping cart data, and cached API responses. Initially, everything uses React Context, but the app re-renders entirely whenever any state changes. Performance degrades, and debugging state changes is impossible — you can't tell which component updated what. You migrate to Zustand for global UI state (auth, theme) and React Query for server state (products, orders). Zustand's selector-based subscriptions eliminate unnecessary re-renders, and React Query's DevTools let you inspect cache state. The app becomes snappy again, and the team can trace state changes in seconds.",
        explanation:
          "State management encompasses five categories: local state (useState, signals), global state (Redux, Zustand, Context API), server state (React Query, SWR, RTK Query), URL state (query params, route params), and persisted state (localStorage, IndexedDB). Redux follows three principles: single source of truth, read-only state via actions, pure reducers. Redux Toolkit (RTK) eliminates boilerplate with createSlice (auto-generates actions/reducers), configureStore (sensible defaults), createAsyncThunk (async actions), and RTK Query (data fetching + caching). Zustand offers a minimalist hook-based API with selector subscriptions. Jotai and Recoil use atomic state where each piece is an independent atom. Valtio uses proxy-based mutable state. NgRx is the Angular equivalent with Actions, Reducers, Effects (RxJS-based side effects), Entity (normalized CRUD), and Selectors. Context API + useReducer provides a lightweight Redux-like pattern for simpler needs. Server state libraries like React Query and SWR handle caching, background refetching, pagination, and optimistic updates. Middleware intercepts dispatched actions for cross-cutting concerns (logging, crash reporting, analytics). Normalizr denormalizes nested API responses into flat entity maps.",
        keyPoints: [
          "Redux: single store, actions dispatch to pure reducers, unidirectional data flow",
          "Redux Toolkit: createSlice (auto actions/reducers), configureStore (RTK defaults), createAsyncThunk (async), RTK Query (caching)",
          "Zustand: minimal API (create), selector subscriptions prevent unnecessary re-renders, ~1KB bundle",
          "Jotai/Recoil: atomic state — each atom is independent, automatic memoization, async atoms",
          "Valtio: proxy-based mutable state, useSnapshot for reactive access",
          "NgRx: Actions, Reducers, Effects (RxJS), Entity (normalized CRUD), Selectors (memoized)",
          "Context API + useReducer: lightweight Redux pattern, re-renders all consumers on change",
          "React Query / SWR: server state caching, background refetching, pagination, optimistic updates",
          "Middleware: intercept actions for logging, crash reporting, analytics, async handling",
          "Normalizr: flatten nested API responses into normalized entity maps for O(1) lookups",
        ],
        tips: [
          "Use Context for low-frequency global state (theme, locale); use Redux/Zustand for high-frequency updates",
          "Never put server state in Redux — use React Query or SWR for caching, deduplication, and background refetching",
          "Profile before optimizing state — unnecessary re-renders are often caused by prop references, not state management",
          "Learn one library deeply (RTK or Zustand), then understand the patterns — they transfer to others",
          "For Angular apps, prefer NgRx for complex state, signals for simple state, and services with BehaviorSubject for medium cases",
        ],
        sampleQuestions: [
          "What is state management and why is it needed in frontend applications?",
          "Explain the core principles of Redux.",
          "What is the Redux data flow?",
          "What is the difference between Redux and React Context API?",
          "What is Redux Toolkit and how does it simplify Redux?",
          "How does createSlice work in Redux Toolkit?",
          "What is createAsyncThunk and how does it handle async actions?",
          "What is RTK Query and how does it differ from createAsyncThunk?",
          "What are selectors and why is memoization important?",
          "What is Redux middleware? Explain applyMiddleware and the middleware chain.",
          "What is the difference between Redux Thunk and Redux Saga?",
          "What is Zustand and how does it compare to Redux?",
          "What is Jotai and what problem does it solve?",
          "What is the difference between Redux and NgRx?",
          "Explain NgRx Store, Actions, Reducers, and Selectors.",
          "What are NgRx Effects and how do they handle side effects?",
          "What is NgRx Entity and how does it simplify CRUD operations?",
          "How do you test Redux reducers and async thunks?",
          "What is Immer and how does Redux Toolkit use it?",
          "What is the `configureStore` function in Redux Toolkit?",
          "What is createEntityAdapter in Redux Toolkit?",
          "What is the difference between global state and server state?",
          "What is React Query (TanStack Query) and how does it work?",
          "What is SWR and how does it compare to React Query?",
          "What is the Context API and when would you use it with useReducer?",
          "What is middleware in state management and why use it?",
          "What is the `normalizr` library and when would you use it?",
          "What is Recoil and how does it differ from Jotai?",
          "What is persist middleware and how does it work with Zustand?",
          "What is Valtio and how does it compare to Zustand?",
          "How do you handle undo/redo in state management?",
        ],
      },
    },
    {
      title: "AI Basics for Frontend Engineers",
      content: {
        overview:
          "AI integration is becoming a standard frontend skill. This chapter covers LLM fundamentals, prompt engineering, AI API integration (OpenAI, Anthropic), streaming, embeddings, RAG, AI agents, embeddings and vector search, caching strategies, testing AI features, and ethical considerations.",
        realLifeScenario:
          "Your team is building a documentation search feature. Users type natural language queries and expect accurate answers from your internal knowledge base. Simple keyword search returns irrelevant results because users don't know the exact terminology. You implement RAG: index all documentation as embeddings in Pinecone, use semantic search to retrieve relevant chunks, and feed them to GPT-4o-mini to generate contextual answers with source citations. Search success rate jumps from 45% to 92%. But now you face new challenges: managing token costs, handling rate limits, streaming responses to avoid timeout, and ensuring the AI doesn't hallucinate information not in the docs.",
        explanation:
          "LLMs (GPT-4, Claude, Gemini) are transformers trained to predict the next token. Prompt engineering designs inputs to get reliable outputs — system prompts set behavior, few-shot examples guide format, chain-of-thought improves reasoning. Temperature controls randomness (0 = deterministic, 1 = creative). AI API integration requires a backend proxy for API key security, streaming via SSE for better UX, and error handling with retries for rate limits (429). Embeddings convert text to vectors for semantic search and RAG. RAG retrieves relevant documents from a vector DB and injects them into the prompt for grounded, up-to-date answers. Fine-tuning updates model weights for specialized tasks but is expensive and static. AI agents use tools and multi-step reasoning to accomplish tasks. Vector databases (Pinecone, pgvector) enable efficient similarity search using ANN algorithms. Caching strategies (exact match, semantic, TTL-based) reduce cost and latency. Testing AI features requires semantic similarity assertions, invariant checks, and format validation rather than exact output matching. Ethical considerations include transparency (label AI content), privacy (anonymize data), bias testing, and human-in-the-loop for high-stakes decisions.",
        keyPoints: [
          "LLMs predict the next token using transformer self-attention — context windows limit input length",
          "Prompt engineering: system prompts, few-shot examples, chain-of-thought, temperature control",
          "AI API integration: backend proxy for security, SSE streaming, exponential backoff retries",
          "Embeddings: vector representations for semantic similarity, cosine similarity for comparison",
          "RAG: retrieve relevant documents → inject into prompt → generate grounded answers",
          "Fine-tuning updates model weights; RAG is cheaper, more current, and more transparent",
          "AI agents use tools, maintain state, and loop until goal completion",
          "Vector databases (Pinecone, pgvector) enable efficient ANN-based similarity search",
          "Cache AI responses: exact match, semantic cache (embedding similarity), TTL-based",
          "Test AI features with semantic similarity, invariants, format validation — not exact matches",
          "Ethics: label AI content, anonymize PII, test for bias, provide human oversight",
        ],
        tips: [
          "Always use a backend proxy for AI API calls — never expose API keys in client code",
          "Stream AI responses via SSE for better UX — users prefer seeing tokens appear vs waiting",
          "Implement rate limiting and caching on the backend to control costs and prevent abuse",
          "Use smaller/cheaper models (GPT-4o-mini, Claude Haiku) for simple tasks, larger models for complex reasoning",
          "Label all AI-generated content clearly — transparency builds user trust",
          "Test AI features with diverse inputs to detect bias and edge cases",
        ],
        sampleQuestions: [
          "What is Artificial Intelligence and how does it differ from traditional programming?",
          "What are Large Language Models (LLMs) and how do they work?",
          "What is prompt engineering and what are common techniques?",
          "How do you integrate OpenAI or Anthropic APIs into a frontend application?",
          "What is streaming in AI responses and how do you implement it?",
          "What are tokens in the context of LLMs and how do they affect cost and performance?",
          "What is the difference between fine-tuning and RAG (Retrieval Augmented Generation)?",
          "What are embeddings and how are they used in AI applications?",
          "What is temperature in LLM parameters and how does it affect output?",
          "What are AI-powered UI patterns that frontend engineers build?",
          "How do you handle AI API errors and rate limits in frontend applications?",
          "What is the Transformer architecture in simple terms?",
          "How do you evaluate the quality of AI-generated content?",
          "What is an AI agent and how does it differ from a simple LLM call?",
          "What is AI safety and what should frontend engineers consider?",
          "How do you build AI-powered search with embeddings and vector databases?",
          "What is Retrieval Augmented Generation (RAG) and how do you implement it?",
          "What is caching strategies for AI API responses?",
          "How do you test AI-powered features?",
          "What are the ethical considerations when building AI features?",
        ],
      },
    },
    {
      title: "Frontend Testing",
      content: {
        overview:
          "Testing is a critical skill for frontend engineers. This chapter covers the testing trophy, Jest vs Vitest, React Testing Library, mocking, async testing, E2E with Playwright/Cypress, snapshot testing, accessibility testing, visual regression, CI/CD integration, and strategies for handling flaky tests.",
        realLifeScenario:
          "Your team's React application has zero tests. Every deployment requires manual QA — a full regression test takes two days. Bug escape rate is high. You introduce Vitest with React Testing Library for unit/integration tests, MSW for API mocking, and Playwright for E2E critical paths. You set up GitHub Actions to run tests on every PR, with coverage thresholds and Playwright visual regression checks. The first month is painful — tests catch 47 bugs before production, QA time drops to 4 hours, and the team gains confidence to deploy daily. The key was prioritizing integration tests (testing trophy) over unit tests, and using MSW to mock APIs at the network level for realistic test scenarios.",
        explanation:
          "The testing trophy prioritizes integration tests over unit tests and E2E — integration tests give the best confidence-to-effort ratio. Vitest reuses Vite config and is faster than Jest. React Testing Library tests behavior (not implementation) using accessible queries (getByRole, getByLabelText) and userEvent for realistic interactions. MSW mocks APIs at the network level for realistic integration tests. Async testing uses findBy queries and waitFor. Mocking isolates the code under test — mock at module boundaries (API, timers, browser APIs). Snapshot testing catches unintended UI changes but is brittle — prefer focused assertions. E2E with Playwright tests critical user journeys with auto-wait and multi-browser support. Accessibility testing uses axe-core for automated checks. Visual regression testing compares screenshots pixel-by-pixel. CI/CD runs tests in stages: fast checks first (types, lint) then unit/integration, then E2E in parallel. Flaky tests destroy trust — investigate and fix or remove them.",
        keyPoints: [
          "Testing trophy: integration tests (most valuable) > unit tests > E2E > static analysis",
          "Vitest: Vite-native, faster than Jest, reuses vite config, compatible Jest API",
          "RTL queries: getBy (must exist), queryBy (check absence), findBy (async appear)",
          "userEvent over fireEvent — simulates realistic full interaction sequences",
          "MSW mocks APIs at network level — same handlers in dev and test",
          "Mock at module boundaries (API, timers, browser APIs), not internal implementation",
          "findBy queries and waitFor handle async rendering and state updates",
          "Playwright: auto-wait, multi-browser, visual comparisons, codegen",
          "Accessibility: axe-core automated checks + keyboard navigation + screen reader testing",
          "CI/CD: fail fast (types → lint → unit → integration → E2E), parallel sharding",
          "Flaky tests: common causes are timing, test pollution, non-deterministic data",
        ],
        tips: [
          "Write tests from the user's perspective — what does the user see and do?",
          "Prefer findBy over waitFor for DOM assertions — it's cleaner and has built-in retry",
          "Use MSW for API mocking — it's more realistic than module-level mocks",
          "Don't test implementation details (state, internal methods) — test behavior",
          "Keep tests independent — clean up between tests, don't rely on test order",
          "Add accessibility checks to your test suite early — they catch subtle bugs",
          "Run slow tests (E2E, visual regression) only on PRs to main branches",
        ],
        sampleQuestions: [
          "What are the different types of testing in frontend applications?",
          "What is the difference between Jest and Vitest?",
          "How do you test React components with React Testing Library?",
          "How do you test asynchronous code in React components?",
          "How do you mock API calls in frontend tests?",
          "What is the purpose of `data-testid` and when should you use it?",
          "How do you test React hooks?",
          "What is mocking and when should you use it?",
          "How do you test React forms?",
          "What are snapshot tests and what are their pitfalls?",
          "How do you test React Context providers and consumers?",
          "What is End-to-End (E2E) testing and which tools are commonly used?",
          "What is test coverage and what is a good target?",
          "How do you test component events and user interactions?",
          "How do you test React Router navigation?",
          "How do you test accessibility in frontend applications?",
          "How do you mock browser APIs like localStorage and timers?",
          "What is the Testing Trophy and how does it differ from the Testing Pyramid?",
          "How do you set up testing in a CI/CD pipeline?",
          "How do you test React error boundaries?",
          "What is visual regression testing and which tools support it?",
          "What is the difference between `screen.getBy`, `screen.queryBy`, and `screen.findBy`?",
          "How do you test custom React hooks that use side effects?",
          "How do you test components with TypeScript generics?",
          "How do you test React portals?",
          "How do you test form validation libraries like React Hook Form or Formik?",
          "What is the purpose of testing library `container` and `baseElement`?",
          "How do you handle flaky tests?",
          "How do you test components that use WebSockets or Server-Sent Events?",
          "What are Test Doubles and what types exist?",
          "How do you test memoized components with React.memo and useMemo?",
          "How do you set up Vitest in a Vite project?",
        ],
      },
    },
  ],
  "backend-engineer": [
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
        sampleQuestions: [
          "What is the difference between SQL and NoSQL databases?",
          "What is normalization in databases and what are the normal forms?",
          "What is indexing in databases and how does it work?",
          "What are ACID properties in databases?",
          "What is denormalization and when should you use it?",
          "Explain database transactions and isolation levels.",
          "What is the N+1 query problem and how do you solve it?",
          "What is the EXPLAIN command and how do you use it for query optimization?",
          "What is the difference between a primary key and a foreign key?",
          "Explain the different types of JOINs in SQL.",
          "What is database sharding and how does it work?",
          "What is the difference between partitioning and sharding?",
          "What is connection pooling and why is it important?",
          "What are read replicas and how do they improve database performance?",
          "What are materialized views and when should you use them?",
          "Explain the different types of indexes (B-tree, Hash, GiST, GIN).",
          "How does composite index column order affect query performance?",
          "What is a deadlock in databases and how do you prevent it?",
          "What is the difference between a UNIQUE constraint and a PRIMARY KEY?",
          "What are database migrations and how do you manage them?",
          "What is the difference between ORM and raw SQL? When should you use each?",
          "What is full-text search and how does it differ from LIKE queries?",
          "What is lazy loading vs eager loading in ORMs?",
          "What is database locking and what are the types of locks?",
          "What is the CAP theorem and how does it apply to databases?",
          "What is the difference between TRUNCATE, DELETE, and DROP in SQL?",
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
        sampleQuestions: [
          "What is an API and how does it work?",
          "Explain REST and its key principles.",
          "What is the difference between GET, POST, PUT, PATCH, and DELETE in REST APIs?",
          "What is the difference between PUT and PATCH in REST API?",
          "What are the common HTTP status codes and their meanings?",
          "What is CORS and why do we need it?",
          "What is API versioning and what strategies exist?",
          "Explain pagination in REST APIs — offset vs cursor-based.",
          "How do you handle errors in REST APIs?",
          "What is rate limiting and how does it work?",
          "What is idempotency and why does it matter in APIs?",
          "Explain HATEOAS in REST.",
          "What is OpenAPI/Swagger and why should you use it?",
          "What is an API Gateway?",
          "Explain JWT — structure, workflow, and security considerations.",
          "Explain OAuth2 and the authorization code flow.",
          "What is the difference between REST and GraphQL?",
          "What are WebSockets and how do they differ from HTTP?",
          "What is gRPC and how does it compare to REST?",
          "What are webhooks and how do they work?",
          "How do you secure a REST API?",
          "What are caching strategies for APIs?",
          "What is request validation and why is it important?",
          "Explain the difference between SOAP and REST.",
          "What is Middleware in Node.js / Express?",
        ],
      },
    },
    {
      title: "Spring Boot & Java Ecosystem",
      content: {
        overview:
          "Spring Boot is the most popular Java framework for building production-grade microservices and web applications. This chapter covers auto-configuration, dependency injection, data access, security, testing, and deployment.",
        realLifeScenario:
          "Your team is migrating a legacy Java EE monolithic application to Spring Boot microservices. The legacy app has manual XML configuration, hardcoded database connections, and no testing. You create a new Spring Boot service with auto-configuration, Spring Data JPA for database access, Spring Security with JWT authentication, and an Actuator health endpoint. Tests with MockMvc and @SpringBootTest catch regressions early. The migration reduces boilerplate by 70% and deployment time from hours to minutes.",
        explanation:
          "Spring Boot auto-configuration: @EnableAutoConfiguration scans the classpath and configures beans based on dependencies (e.g., H2 on classpath → embedded DB, spring-webmvc → DispatcherServlet). Dependency injection: @Autowired, constructor injection (preferred), @Qualifier for disambiguation. Data access: Spring Data JPA (CrudRepository, JpaRepository), @Entity, @Transactional. Spring Security: SecurityFilterChain, JWT filters, @PreAuthorize, OAuth2 resource server. Testing: @SpringBootTest, @WebMvcTest, @DataJpaTest, Testcontainers. Actuator: health, metrics, info endpoints for production monitoring.",
        keyPoints: [
          "Auto-configuration simplifies setup — @SpringBootApplication combines @Configuration, @EnableAutoConfiguration, @ComponentScan",
          "Constructor injection is preferred over field injection — ensures immutability and testability",
          "Spring Data JPA eliminates boilerplate DAO code — define interfaces, get CRUD for free",
          "SecurityFilterChain replaced the old WebSecurityConfigurerAdapter — chain security rules declaratively",
          "Actuator provides production-ready endpoints: /health, /metrics, /info, /env, /loggers",
          "@SpringBootTest loads the full application context — use slices (@WebMvcTest, @DataJpaTest) for faster focused tests",
        ],
        tips: [
          "Use @ConfigurationProperties for type-safe external configuration instead of raw @Value",
          "Prefer @Transactional(readOnly = true) on read-only queries — it hints the JPA provider for optimizations",
          "Keep controllers thin — business logic belongs in @Service, data access in @Repository",
          "Use @ExceptionHandler + @ControllerAdvice for consistent error responses across all endpoints",
          "Profile your app with Micrometer + Prometheus before optimizing — the bottleneck is rarely where you expect",
        ],
        sampleQuestions: [
          "What is Spring Boot and how does it differ from Spring Framework?",
          "Explain auto-configuration in Spring Boot and how @EnableAutoConfiguration works.",
          "What is the difference between @Component, @Service, @Repository, and @Controller?",
          "How does dependency injection work in Spring Boot? Explain constructor vs field injection.",
          "What is Spring Data JPA and how do you define a repository?",
          "Explain @Transactional — propagation, isolation levels, and rollback rules.",
          "How does Spring Security work? Explain the SecurityFilterChain and JWT authentication flow.",
          "What is @ControllerAdvice and how do you use it for global exception handling?",
          "Explain the different testing slices: @WebMvcTest, @DataJpaTest, @RestClientTest.",
          "What is Spring Boot Actuator and what production endpoints does it provide?",
          "How do you configure external properties in Spring Boot? Explain application.yml, profiles, and @ConfigurationProperties.",
          "What is the difference between @RestController and @Controller in Spring MVC?",
          "Explain AOP in Spring — @Aspect, @Before, @After, @Around, and common use cases (logging, transactions).",
          "What is Spring Cloud and how does it help with microservices (service discovery, config server, circuit breaker)?",
          "How does Spring Boot handle database migrations? Explain Flyway and Liquibase integration.",
          "What is the Spring Boot bean lifecycle? Explain @PostConstruct, @PreDestroy, and BeanPostProcessor.",
          "How do you implement caching in Spring Boot with @Cacheable, @CacheEvict, and @CachePut?",
          "Explain the difference between PUT and PATCH in REST APIs built with Spring Boot.",
          "What is Spring WebFlux and when would you use it over Spring MVC?",
          "How do you secure a Spring Boot REST API with OAuth2 and Keycloak/Auth0?",
          "How do you build a CRUD REST API from scratch in Spring Boot?",
          "How do you validate request bodies in Spring Boot?",
          "How do you handle exceptions in a Spring Boot REST API?",
          "How do you configure logging in Spring Boot with SLF4J/Logback?",
          "How do you schedule background tasks in Spring Boot?",
          "How do you use @Async and @EnableAsync in Spring Boot?",
          "How do you configure CORS in Spring Boot?",
          "How do you write a @SpringBootTest integration test?",
          "How do you handle file upload and download in Spring Boot?",
          "What is the difference between @Value and @ConfigurationProperties?",
          "How do you use @Profile to configure environment-specific beans?",
          "What is the difference between application.properties and application.yml?",
          "How do you use @RequestParam, @PathVariable, and @RequestBody in Spring Boot?",
          "How do you use @MockBean and @SpyBean in Spring Boot tests?",
        ],
      },
    },
    {
      title: ".NET / ASP.NET Core",
      content: {
        overview:
          "ASP.NET Core is a cross-platform, high-performance framework for building modern web applications and APIs. This chapter covers middleware, dependency injection, Entity Framework Core, authentication, and testing.",
        realLifeScenario:
          "Your team builds a high-throughput REST API for a financial trading platform. The initial implementation uses synchronous database calls and no caching. Under load testing at 5000 req/s, P95 latency reaches 4 seconds. You refactor to use async/await throughout, add EF Core compiled queries for hot paths, enable response caching middleware, and implement Redis distributed caching with IDistributedCache. P95 latency drops to 120ms. You also add OpenTelemetry tracing, structured logging with Serilog, and health checks for production monitoring.",
        explanation:
          "ASP.NET Core architecture: Kestrel web server, middleware pipeline (app.UseAuthentication(), app.UseAuthorization(), app.UseCors()), dependency injection built into the framework (AddSingleton, AddScoped, AddTransient). Entity Framework Core: DbContext, migrations (dotnet ef migrations add), LINQ queries, eager/lazy/explicit loading, change tracker. Authentication: JWT (AddJwtBearer), Identity Framework, IdentityServer/OpenIddict for SSO. Minimal APIs vs Controller-based: Minimal APIs are simpler for small services; Controllers with areas scale better. Testing: xUnit, Moq/NSubstitute, WebApplicationFactory for integration testing. Background services: IHostedService, BackgroundService for long-running tasks. SignalR for real-time WebSocket communication.",
        keyPoints: [
          "Middleware pipeline processes requests in order — each middleware can short-circuit (app.Run) or pass to the next (app.Use)",
          "Built-in DI container — lifetimes: Singleton (one instance), Scoped (per request), Transient (per injection)",
          "Entity Framework Core is an ORM with migrations, LINQ queries, and support for multiple database providers",
          "JWT authentication: AddJwtBearer validates token signature, issuer, audience automatically",
          "WebApplicationFactory spins up an in-memory test server for full integration tests without HTTP",
          "SignalR enables real-time bidirectional communication via WebSocket with automatic fallback",
        ],
        tips: [
          "Always use async/await for I/O-bound operations — thread pool starvation is a common production issue in .NET",
          "Use IOptions<T> pattern for strongly-typed configuration instead of magic strings",
          "EF Core performance: use AsNoTracking() for read-only queries, compiled queries for hot paths, and batch updates",
          "Implement health checks (AspNetCore.HealthChecks) for database connectivity, cache, and external service dependencies",
          "Use Serilog or NLog for structured logging — query logs by property (e.g., search all errors for a specific UserId)",
        ],
        sampleQuestions: [
          "What are records in C# and how do they differ from classes? Explain with expressions and value-based equality.",
          "Explain pattern matching in C# — switch expressions, property patterns, positional patterns, and list patterns.",
          "How does async/await work at the compiler and CLR level? Explain IAsyncStateMachine and synchronization contexts.",
          "What are nullable reference types in C# 8+? Explain the ? and ! operators and [NotNull] attributes.",
          "Explain LINQ — the difference between IEnumerable and IQueryable, deferred vs immediate execution.",
          "What is Span<T> and when should you use it over arrays? Explain stackalloc and Memory<T>.",
          "What are top-level statements, file-scoped namespaces, and global usings in modern C#?",
          "How do closures and variable capture work in C#? Explain the foreach capture bug in older versions.",
          "Explain the .NET garbage collector — generations, mark-and-sweep, compaction, and the Large Object Heap.",
          "Explain value types vs reference types — where they are stored, boxing/unboxing, and performance implications.",
          "How does the JIT compiler work in .NET? Explain tiered compilation and ReadyToRun.",
          "Explain ref struct, ref return, and in parameters in C#. When should each be used?",
          "What is Memory<T> and how does it differ from Span<T>? Explain their roles in async I/O.",
          "What is ASP.NET Core and how does it differ from the legacy ASP.NET Framework?",
          "Explain the ASP.NET Core middleware pipeline — ordering, short-circuiting, and how to create custom middleware.",
          "What is Kestrel and how does it relate to IIS, NGINX, and other web servers in ASP.NET Core?",
          "How does the ASP.NET Core hosting model work? Explain WebApplication, HostBuilder, and the app lifecycle.",
          "How does configuration work in ASP.NET Core? Explain the configuration builder, sources, and the Options pattern.",
          "Explain the three DI service lifetimes in ASP.NET Core — Singleton, Scoped, Transient — with real-world examples.",
          "How does the built-in DI container resolve services? Explain container resolution, open generics, and factory patterns.",
          "What are the Options pattern interfaces (IOptions, IOptionsSnapshot, IOptionsMonitor) and when should each be used?",
          "Explain the Captive Dependency problem in DI and how to avoid it. Give a concrete example.",
          "What is Entity Framework Core and how do you configure it with a DbContext?",
          "Explain EF Core migrations — how to create, apply, and roll them back.",
          "What is the difference between eager loading (Include), lazy loading, and explicit loading in EF Core?",
          "What is AsNoTracking and when should you use it? Explain compiled queries and FromSql.",
          "How does the EF Core change tracker work? Explain added, modified, deleted, and detached states.",
          "How do you handle concurrency conflicts in EF Core? Explain row versioning and the DbUpdateConcurrencyException.",
          "What is the difference between database-first and code-first approaches in EF Core? When would you use each?",
          "How do you implement JWT authentication in ASP.NET Core Web API?",
          "How does ASP.NET Core Identity work? Explain user management, roles, claims, and external login providers.",
          "What are policy-based authorization and resource-based authorization in ASP.NET Core?",
          "How do you handle refresh tokens with JWT in ASP.NET Core?",
          "What is the difference between Minimal APIs and Controller-based APIs in ASP.NET Core? When would you use each?",
          "How do you handle validation in Minimal APIs? Compare with FluentValidation and Data Annotations.",
          "How do you organize a large Minimal API project? Explain MapGroup and extension methods.",
          "What is SignalR and how does it work in ASP.NET Core? Explain hubs, groups, and connection management.",
          "How does SignalR handle scale-out across multiple servers? Explain the Redis backplane and Azure SignalR Service.",
          "What are IHostedService and BackgroundService in ASP.NET Core? Provide real-world examples.",
          "Explain the Channel<T> type in .NET and how it implements producer-consumer patterns.",
          "How do you test ASP.NET Core APIs using WebApplicationFactory? Explain integration testing patterns.",
          "How do you use Moq or NSubstitute for mocking in .NET unit tests? Explain best practices.",
          "What is xUnit and how does it compare to NUnit and MSTest? Explain theories, fixtures, and parallelization.",
          "How do you use Verify (Snapshooter) for snapshot testing in .NET?",
          "How do you implement caching in ASP.NET Core? Explain IMemoryCache, IDistributedCache, and output caching.",
          "How does rate limiting work in ASP.NET Core 7+? Explain the built-in rate limiting middleware.",
          "What is IAsyncEnumerable in C# and how does it improve streaming performance?",
          "Explain response compression in ASP.NET Core. When should you use it and what are the trade-offs?",
          "What is gRPC and how does it compare to REST? When would you use gRPC in .NET?",
          "How does Blazor work? Explain Blazor Server, Blazor WebAssembly, the .NET runtime in the browser, and auto render mode.",
          "Explain the difference between Blazor Server and Blazor WebAssembly render modes. When would you choose each?",
          "How does gRPC-Web enable gRPC usage in browser applications? Explain the needed proxy configuration.",
          "What is Clean Architecture in .NET and how do you structure a solution using it?",
          "What is MediatR and how does it implement CQRS and the mediator pattern in .NET?",
          "How do you implement structured logging with Serilog in ASP.NET Core?",
          "What are health checks in ASP.NET Core and how do you configure them for Kubernetes liveness and readiness probes?",
          "How do you handle database migrations in production with EF Core? Explain idempotent scripts, bundle, and CI/CD integration.",
        ],
      },
    },
    {
      title: "Laravel (PHP)",
      content: {
        overview:
          "Laravel is the most popular PHP framework, known for its elegant syntax and rich ecosystem. This chapter covers MVC architecture, Eloquent ORM, API development with Sanctum/Passport, queues, and testing.",
        realLifeScenario:
          "Your e-commerce application built with Laravel experiences slow page loads and checkout failures during flash sales. Investigation reveals N+1 queries in the product catalog, synchronous email sending blocking the response, and no caching. You fix N+1 with eager loading (->with()), move email and order processing to queues with Laravel Horizon (Redis driver), implement Redis caching for product listings with Cache::remember(), and use Laravel Octane for persistent application boot. Page load drops from 3s to 200ms, and the site handles 10x the traffic during sales.",
        explanation:
          "Laravel MVC: Routes (web.php, api.php) → Controllers → Eloquent Models → Blade views or JSON responses. Eloquent ORM: ActiveRecord implementation with relationships (hasMany, belongsToMany, morphMany), accessors/mutators, scopes, and eager loading. Artisan CLI: php artisan make:model, migrate, queue:work, tinker. API development: Laravel Sanctum (SPA token-based auth), Passport (OAuth2 server), API Resources for response transformation. Queues: database/Redis/Beanstalkd driver, jobs, events, listeners, Laravel Horizon dashboard for monitoring. Testing: PHPUnit with Laravel helpers (get, post, assertDatabaseHas, actingAs), factories and seeders, HTTP tests with RefreshDatabase. Broadcasting: WebSocket events via Laravel Echo + Pusher/Reverb. Task scheduling: scheduler in kernel.php with ->daily(), ->everyMinute().",
        keyPoints: [
          "Eloquent ORM provides ActiveRecord pattern — define relationships, accessors, mutators, and scopes directly on models",
          "Artisan CLI is the command center — generate code, run migrations, manage queues, and interact with Tinker (REPL)",
          "Sanctum for SPA/API token auth; Passport for full OAuth2 — choose based on complexity needs",
          "Queues with Horizon provide a real-time dashboard — monitor jobs, failures, and throughput",
          "Eloquent eager loading (->with(), ->load()) prevents N+1 — always check with Laravel Debugbar during development",
          "Service providers are the bootstrapping center — register bindings, events, middleware, and route files",
        ],
        tips: [
          "Use Laravel Debugbar or Telescope during development to identify N+1 queries and slow database calls",
          "Always use Form Requests for validation instead of validating in controllers — keeps controllers clean and validation reusable",
          "Use repository pattern or query scopes for complex database logic — avoid bloating Eloquent models",
          "Horizon + Redis is the production queue setup — monitor failed jobs, set retry limits, and use priority queues",
          "Write HTTP tests using RefreshDatabase to ensure test isolation — factories make seeding test data painless",
        ],
        sampleQuestions: [
          "What is Laravel and its core features? Explain the MVC architecture in Laravel.",
          "What is Artisan CLI and what are its most useful commands?",
          "Explain Eloquent ORM — what are models, relationships, accessors, mutators, and scopes?",
          "What is the difference between hasMany, belongsTo, and belongsToMany relationships in Eloquent?",
          "How does eager loading work in Laravel and why is it important for performance?",
          "Explain migrations and seeders in Laravel — how do you manage database schema changes?",
          "What is Laravel Sanctum and how does it differ from Passport?",
          "How do you build a REST API with Laravel? Explain API Resources and JSON responses.",
          "What are Laravel Queues and how do they work with Horizon?",
          "Explain events and listeners in Laravel — how do they decouple application logic?",
          "What are Form Requests in Laravel and how do they handle validation and authorization?",
          "How does authentication work in Laravel? Explain the built-in Auth system and middleware guards.",
          "What is Laravel's service container and how does dependency injection work?",
          "Explain Laravel service providers — what is their role in the bootstrapping process?",
          "What are Laravel facades and how do they differ from dependency injection?",
          "How does caching work in Laravel? Explain Cache::remember, cache drivers, and cache tags.",
          "What is Laravel Octane and how does it improve performance?",
          "How do you test Laravel applications? Explain PHPUnit, HTTP tests, and factories.",
          "What is the Laravel scheduler and how do you define recurring tasks?",
          "How does Laravel handle file storage? Explain the filesystem configuration, local vs cloud (S3) disks.",
          "Explain Laravel Blade templating — sections, layouts, components, and directives.",
          "Explain Laravel broadcasting and Echo — how do real-time WebSocket events work?",
          "What are Laravel policies and gates — how do you implement authorization?",
          "How does Laravel handle database query optimization? Explain the query builder, N+1 detection, and indexes.",
          "What are Laravel middleware and how do you create custom middleware? Explain middleware groups and priorities.",
          "What is route-model binding in Laravel? Explain implicit vs explicit binding.",
          "How do you implement API versioning in Laravel?",
          "Explain Laravel Telescope — what does it monitor and how does it help with debugging?",
          "How do you create a custom Artisan command in Laravel?",
          "How does Laravel handle soft deletes? Explain the SoftDeletes trait and querying trashed models.",
          "What is Laravel Reverb and how does it compare to Pusher for real-time broadcasting?",
          "How do you handle localization and internationalization (i18n) in Laravel?",
          "How do you handle file uploads in Laravel with validation?",
          "What is the Laravel Debugbar and how do you use it for performance profiling?",
          "How does Laravel's notification system work? Explain mail, database, and on-demand notifications.",
          "How do you implement API rate limiting in Laravel?",
          "How do you implement search functionality in Laravel with Scout and Algolia/MeiliSearch?",
          "How do you implement API resources and transforms in Laravel?",
          "How does Laravel handle HTTP client requests? Explain the Http facade and testing HTTP fakes.",
          "How do you handle database transactions in Laravel? Explain DB::transaction and optimistic locking.",
          "How do you deploy a Laravel application? Explain optimization commands and server requirements.",
        ],
      },
    },
    {
      title: "Django (Python)",
      content: {
        overview:
          "Django is a high-level Python web framework that encourages rapid development with its 'batteries-included' philosophy — it provides built-in tools for common tasks like authentication, admin panels, database management, and templating. This chapter covers the MVT pattern, models and the ORM, views and URL routing, templates, forms, Django REST Framework basics, and testing. It is aimed at junior backend engineer interviews.",
        realLifeScenario:
          "You join a team that builds a blog platform with Django. Your first task is to add a 'comments' feature. You create a `Comment` model with a ForeignKey to `Post`, write a `CommentForm` using ModelForm, add a view to handle form submission, and create a template to display comments. You also register the model in the Django admin so editors can moderate comments. The task introduces you to the full Django workflow: models (define data), views (handle requests), templates (render HTML), forms (validate input), and the admin interface (manage data).",
        explanation:
          "Django follows the MVT (Model-View-Template) architecture. **Models** define the database structure using Python classes — each model maps to a database table, each field maps to a column. Django's ORM lets you query the database using Python instead of raw SQL. **Views** contain the business logic — they receive HTTP requests, interact with models, and return responses (typically rendered HTML or JSON). **Templates** are HTML files with Django Template Language variables and tags for dynamic content. Django's URL dispatcher (urls.py) maps URL patterns to views. The framework also includes: the Admin interface (auto-generated CRUD UI), Forms (for input validation and rendering), Django REST Framework (for building APIs), and built-in security features (CSRF protection, XSS escaping, SQL injection prevention via parameterized queries). Migrations track database schema changes alongside code changes.",
        keyPoints: [
          "Django follows MVT: Models (database), Views (logic), Templates (presentation)",
          "A Django project contains multiple apps — each app handles one feature",
          "Django ORM lets you query the database with Python instead of raw SQL",
          "QuerySets are lazy — the database is not hit until the QuerySet is evaluated (iterated, counted, etc.)",
          "Migrations track schema changes — run makemigrations then migrate in sequence",
          "Every model gets an automatic admin interface when registered in admin.py",
          "Django auto-escapes template variables to prevent XSS attacks",
          "The Django REST Framework simplifies building APIs with serializers, ViewSets, and routers",
        ],
        tips: [
          "Always define a __str__ method on your models for readable admin display",
          "Use get() when you expect exactly one result; use filter() when you expect zero or many",
          "Use select_related() for ForeignKey lookups and prefetch_related() for ManyToManyField to prevent N+1 queries",
          "Always include {% csrf_token %} in POST forms to prevent CSRF attacks",
          "Run python manage.py check --deploy before deploying to production to catch security issues",
          "Use django-debug-toolbar during development to inspect SQL queries and performance",
          "Keep your views thin — put business logic in models or helper functions",
          "Name your URL patterns and use the {% url %} template tag instead of hardcoding paths",
        ],
        sampleQuestions: [
          "What is Django and what is the MVT (Model-View-Template) architecture?",
          "What is the difference between a Django project and a Django app?",
          "What is the purpose of the manage.py file in Django?",
          "What is the Django admin interface and how do you access it?",
          "Explain the Django request-response cycle.",
          "What are Django settings and how do you configure them for different environments?",
          "How do you define a model in Django and what is it used for?",
          "What are common field types in Django models?",
          "What are migrations in Django and how do they work?",
          "What is the difference between `makemigrations` and `migrate` in Django?",
          "What are the three types of relationships in Django models?",
          "What is the `__str__` method in Django models and why is it important?",
          "What is a QuerySet in Django?",
          "What does it mean that Django QuerySets are lazy?",
          "How do you perform CRUD operations using the Django ORM?",
          "How do you filter QuerySets in Django?",
          "What is the difference between `get()` and `filter()` in Django ORM?",
          "What is the difference between `select_related()` and `prefetch_related()` in Django?",
          "What is the difference between function-based views and class-based views in Django?",
          "How do you define URL patterns in Django?",
          "What path converters are available in Django URL patterns?",
          "What are generic class-based views in Django?",
          "What is the Django Template Language (DTL) and how does it work?",
          "How does template inheritance work in Django?",
          "How do you use built-in template tags and filters in Django?",
          "How do you create a form in Django?",
          "What happens when you call `is_valid()` on a Django form?",
          "What is the difference between `forms.Form` and `forms.ModelForm` in Django?",
          "What is Django REST Framework (DRF) and why would you use it?",
          "What are serializers in Django REST Framework?",
          "How does authentication work in Django?",
          "How does Django protect against common security threats?",
          "How do you test Django applications?",
        ],
      },
    },
    {
      title: "Node.js & Express.js",
      content: {
        overview:
          "Node.js is the most popular JavaScript runtime for building server-side applications, and Express.js is the leading web framework built on top of it. This chapter covers the Node.js event loop, module system, file I/O, streams, process management, npm, and Express.js concepts including middleware, routing, error handling, CORS, and REST API design.",
        realLifeScenario:
          "You are building a real-time dashboard API that aggregates data from multiple third-party services, transforms it, and serves it to thousands of concurrent clients. You choose Node.js for its non-blocking I/O model — the event loop efficiently handles hundreds of simultaneous API calls to external services without creating a thread per request. You use Express.js with a Router-based structure: /api/users, /api/metrics, /api/reports. For large CSV exports, you use Node.js streams to pipe data directly to the response without buffering the entire file in memory. You add middleware for authentication (JWT verification), rate limiting (express-rate-limit), CORS for the frontend domain, and a centralized error handler. Worker threads handle CPU-intensive aggregation tasks off the main thread. The result: a lean, high-throughput API that handles 10,000 concurrent connections on a single server instance.",
        explanation: `## The Event Loop

  Node.js uses a single-threaded event loop to handle asynchronous operations. The loop runs in six phases:

  1. **timers** — executes setTimeout and setInterval callbacks
  2. **pending callbacks** — executes I/O callbacks deferred to the next iteration
  3. **idle, prepare** — internal use only
  4. **poll** — retrieves new I/O events; executes I/O callbacks; blocks when no timers are pending
  5. **check** — executes setImmediate callbacks
  6. **close callbacks** — executes 'close' event handlers (e.g., socket.on('close'))

  \`\`\`javascript
  const fs = require('fs');
  const path = require('path');

  console.log('Start');

  setTimeout(() => console.log('Timer'), 0);
  setImmediate(() => console.log('Immediate'));

  fs.readFile(__filename, () => {
    console.log('I/O callback');
    process.nextTick(() => console.log('Next tick inside I/O'));
  });

  console.log('End');
  // Output: Start, End, Timer, Immediate, I/O callback, Next tick inside I/O
  \`\`\`

  process.nextTick() is not part of the event loop — its callbacks run after the current phase completes, before the next phase begins. This can cause I/O starvation if used recursively.

  ## Module System

  Node.js supports two module systems:

  **CommonJS** (default): uses require() and module.exports. Synchronous, runtime resolution, cached after first load.

  **ES Modules**: uses import/export. Static analysis, asynchronous, supports tree-shaking. Enabled via "type": "module" in package.json or .mjs extension.

  \`\`\`javascript
  // CommonJS — math.cjs
  module.exports.add = (a, b) => a + b;
  const { add } = require('./math.cjs');

  // ES Module — math.mjs
  export const add = (a, b) => a + b;
  import { add } from './math.mjs';
  \`\`\`

  ## File I/O and Streams

  fs.readFile loads entire files into memory. Streams process data in chunks:

  \`\`\`javascript
  const fs = require('fs');
  const zlib = require('zlib');

  // Stream: read → transform → write
  fs.createReadStream('input.txt')
    .pipe(zlib.createGzip())
    .pipe(fs.createWriteStream('input.txt.gz'))
    .on('finish', () => console.log('Done'));
  \`\`\`

  Four stream types: Readable, Writable, Duplex (TCP sockets), Transform (zlib, crypto). Backpressure is managed automatically through the pipe() method.

  ## Process and Globals

  Key global objects: process (process info, env), Buffer (binary data), \_\_dirname, \_\_filename, exports/module, console, setTimeout/setInterval, setImmediate. Environment variables via process.env.

  Child processes: spawn() for streaming large output, exec() for buffered small output. Worker threads for CPU-intensive tasks. Cluster module for multi-core load balancing.

  ## npm and package.json

  Essential fields: name, version, main, scripts, dependencies, devDependencies, peerDependencies. Semver: MAJOR.MINOR.PATCH. Caret (^) allows minor/patch updates, tilde (~) allows only patch. package-lock.json ensures reproducible builds. npx executes packages without global install.

  \`\`\`json
  {
    "name": "my-api",
    "version": "1.0.0",
    "main": "src/server.js",
    "scripts": {
      "start": "node src/server.js",
      "dev": "nodemon src/server.js"
    },
    "dependencies": {
      "express": "^4.18.0"
    },
    "devDependencies": {
      "nodemon": "^3.0.0"
    }
  }
  \`\`\`

  ## Express.js Middleware

  Middleware functions process requests in sequence. They receive req, res, and next. Call next() to pass control to the next middleware in the chain.

  \`\`\`javascript
  const express = require('express');
  const app = express();

  // Application-level middleware
  app.use(express.json());
  app.use(cors());

  // Custom middleware
  app.use((req, res, next) => {
    req.requestTime = Date.now();
    next();
  });

  // Route handler
  app.get('/api/users', (req, res) => {
    res.json({ users: [], timestamp: req.requestTime });
  });

  // Error-handling middleware (4 params)
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(3000);
  \`\`\`

  ## Routing with Express Router

  express.Router() creates modular route groups:

  \`\`\`javascript
  const router = express.Router();

  router.get('/users', getUsers);
  router.post('/users', createUser);
  router.get('/users/:id', getUserById);

  app.use('/api', router);
  \`\`\`

  ## Error Handling Patterns

  - Synchronous errors are caught automatically
  - Async errors must be forwarded via next(err) or catch(next)
  - Use a wrapper for async handlers: const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
  - Centralized error middleware at the end of the chain

  ## CORS and Static Files

  \`\`\`javascript
  const cors = require('cors');
  app.use(cors({ origin: 'https://myapp.com', credentials: true }));
  app.use(express.static('public', { maxAge: '1d' }));
  \`\`\`

  CORS is a browser security mechanism — it does not block server-to-server requests. express.static is the built-in middleware for serving static assets.

  ## REST API Design Best Practices

  - Plural nouns for resources: /users, /orders
  - Proper HTTP methods: GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove)
  - Versioning: /api/v1/users
  - Pagination: ?page=1&limit=20 or cursor-based
  - Consistent JSON responses: { data, error, meta }
  - Input validation (Zod, Joi), authentication middleware, rate limiting
  - Proper status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error`,
        keyPoints: [
          "The event loop has six phases (timers, pending, idle/prepare, poll, check, close) — process.nextTick runs between phases, not as a phase",
          "CommonJS (require) is synchronous; ES modules (import) are static and support tree-shaking; both coexist in Node.js",
          "Streams process data in chunks — essential for large files and network responses; four types: Readable, Writable, Duplex, Transform",
          "Worker threads handle CPU-intensive work; Cluster distributes load across CPU cores; child_process.spawn vs exec depends on output size",
          "npm uses semver (^ for minor, ~ for patch); package-lock.json ensures reproducible installs; npx runs packages without global install",
          "Express middleware runs in registration order — call next() to pass control; error-handling middleware has four parameters (err, req, res, next)",
          "express.Router() enables modular route separation — the standard pattern for structuring Express applications",
          "Async errors in Express must be explicitly forwarded via next(err) or an async wrapper — they are not caught automatically",
        ],
        tips: [
          "Memorize the six event loop phases and where process.nextTick and setImmediate run — this is the most common Node.js deep-dive question",
          "Know the stream types (Readable, Writable, Duplex, Transform) and backpressure — mention pipe() for automatic backpressure handling",
          "Compare CommonJS vs ESM explicitly: require is runtime, dynamic, synchronous; import is static, top-level, asynchronous",
          "For Express, understand the full middleware chain — app.use vs app.get, Router, error middleware, and the async error wrapping pattern",
          "Discuss CORS as a browser security mechanism (not server-to-server) and how to configure it with the cors package",
          "Be ready to design a REST API structure: naming conventions, HTTP methods, status codes, versioning, pagination, and consistent response format",
        ],
        sampleQuestions: [
          "What is the Node.js event loop?",
          "What is the difference between require() and import in Node.js?",
          "What are the differences between CommonJS and ES modules in Node.js?",
          "What are the global objects available in Node.js?",
          "What is the difference between fs.readFile and streams for reading files?",
          "What is the Buffer class in Node.js?",
          "How does the path module work in Node.js?",
          "How do you use environment variables in Node.js?",
          "What is the difference between spawn() and exec() in child_process?",
          "What are Worker Threads in Node.js?",
          "What is the Cluster module in Node.js?",
          "How do you handle errors in Node.js?",
          "What are the essential fields in a package.json file?",
          "What is semantic versioning (semver) in Node.js?",
          "What are the different dependency types in package.json?",
        ],
      },
    },
    {
      title: "Authentication & Authorization",
      content: {
        overview:
          "Authentication and authorization are the foundation of web application security. Authentication verifies who a user is; authorization determines what they can access. This chapter covers JWT, sessions, OAuth 2.0, RBAC, Clerk, bcrypt, SSO, MFA, and related security patterns essential for backend interviews.",
        realLifeScenario:
          "Your SaaS platform needs to support 50,000 users with role-based access (admin, editor, viewer), social login (Google, GitHub), MFA for admin accounts, and API access for third-party integrations. You start with session-based auth in a monolith but quickly hit scaling issues — sessions require a shared Redis store, and the monolith cannot be split without re-authenticating on every service. You migrate to JWT-based auth with RS256 signing, allowing any microservice to verify tokens using a public key. You integrate Clerk for social login and user management, implement RBAC with a middleware that checks roles from the JWT claims, and add TOTP-based MFA for admin accounts. The result: stateless authentication, zero shared session store, and granular access control across all services.",
        explanation: `## Authentication Fundamentals

  Authentication answers "who are you?" Users prove their identity via one or more factors: something you know (password), something you have (phone, hardware token), or something you are (biometrics). The authentication process typically involves credential validation, session creation, and token issuance.

  ### Password Hashing with bcrypt

  Never store passwords in plain text. Use bcrypt, Argon2, or scrypt — adaptive hashing algorithms designed to be slow. bcrypt automatically generates a unique salt for each password and incorporates a cost factor that can be increased as hardware improves.

  \`\`\`javascript
  const bcrypt = require('bcrypt');
  const saltRounds = 12;

  async function hashPassword(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
  \`\`\`

  Hashing is one-way; encryption is two-way. Always hash passwords, never encrypt them.

  ## JWT (JSON Web Tokens)

  JWT is a stateless authentication mechanism. A token contains three Base64-encoded parts: header (algorithm, type), payload (claims like sub, iat, exp), and signature (verifies integrity). RS256 (asymmetric) is preferred for microservices — services verify with a public key without access to the private signing key.

  \`\`\`javascript
  const jwt = require('jsonwebtoken');

  function generateToken(userId, role) {
    return jwt.sign(
      { sub: userId, role, iat: Math.floor(Date.now() / 1000) },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  function verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return null; // token expired or invalid
    }
  }
  \`\`\`

  JWT is stateless — no server-side session store needed. However, revocation requires a blocklist because valid tokens cannot be invalidated before expiration.

  ## Session-Based Authentication

  Sessions store state server-side. The server creates a session, stores it (memory, Redis, DB), and sends a session ID cookie to the client. Sessions are stateful — they scale horizontally with a shared session store but allow immediate revocation.

  ## OAuth 2.0

  OAuth 2.0 is an authorization framework. Four roles: resource owner (user), client (app), authorization server, resource server. The authorization code flow is the most secure: redirect user → consent → authorization code → exchange for tokens. PKCE extends this for public clients (SPAs, mobile apps).

  ## OpenID Connect (OIDC)

  OIDC builds on OAuth 2.0 for authentication. It adds an ID token (JWT with user identity) and a UserInfo endpoint. OAuth 2.0 handles authorization ("what you can do"); OIDC handles authentication ("who you are").

  ## Role-Based Access Control (RBAC)

  RBAC assigns permissions to roles, and roles to users. This simplifies authorization management at scale. Implement with middleware that extracts roles from the JWT and checks against required permissions.

  \`\`\`javascript
  function authorize(...allowedRoles) {
    return (req, res, next) => {
      const userRole = req.user.role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    };
  }
  \`\`\`

  ## Security Best Practices

  - Store JWTs in HttpOnly, Secure, SameSite cookies (not localStorage)
  - Short token expiration (15-60 minutes) with refresh token rotation
  - Always use HTTPS to prevent token interception
  - Implement rate limiting on auth endpoints to prevent brute-force attacks
  - Use MFA for privileged accounts
  - Regenerate session IDs after login to prevent session fixation`,
        keyPoints: [
          "Authentication verifies identity; authorization controls access — both must be implemented together",
          "bcrypt/Argon2 for password hashing — slow, salted, adaptive to hardware improvements",
          "JWT provides stateless authentication — header.payload.signature, RS256 for microservices",
          "Sessions are stateful and revocable but require shared storage across instances",
          "OAuth 2.0 is an authorization framework; OIDC adds authentication on top",
          "RBAC assigns permissions to roles, roles to users — simplifies access control at scale",
          "MFA adds a second factor (TOTP, SMS, biometric) — critical for privileged accounts",
          "JWT security: short TTL, HttpOnly cookies, signature verification, never store secrets in payload",
        ],
        tips: [
          "Know the OAuth 2.0 authorization code flow end-to-end — it is the most common interview deep-dive",
          "Compare JWT vs sessions explicitly: stateless scalability vs immediate revocation",
          "Explain why bcrypt is preferred over SHA-256 for passwords — the speed difference is the key point",
          "Discuss token storage: HttpOnly cookies are safer than localStorage against XSS",
          "Mention PKCE when discussing SPAs and mobile OAuth flows — shows recent standards knowledge",
        ],
        sampleQuestions: [
          "What is authentication and how does it differ from authorization?",
          "Explain how JWT (JSON Web Token) works.",
          "What are the main parts of a JWT?",
          "How do sessions work in web applications?",
          "Explain the OAuth 2.0 authorization code flow.",
          "What is the difference between OAuth 2.0 and OpenID Connect?",
          "What is bcrypt and why is it used for password hashing?",
          "What is RBAC (Role-Based Access Control)?",
          "What is SSO (Single Sign-On) and how does it work?",
          "What is MFA (Multi-Factor Authentication)?",
          "What is the difference between access tokens and refresh tokens?",
          "How do you securely store passwords?",
          "What are the security considerations when using JWT?",
          "How do microservices handle authentication?",
          "What is the difference between stateful and stateless authentication?",
        ],
      },
    },
    {
      title: "Security Basics",
      content: {
        overview:
          "Web security is every backend engineer's responsibility. This chapter covers the most critical vulnerabilities — SQL injection, XSS, CSRF, SSRF, IDOR — and defensive measures like HTTPS, CSP, input validation, secure headers, and the OWASP Top 10 framework.",
        realLifeScenario:
          "Your e-commerce platform handles 10,000 orders per day. A penetration test reveals: the search endpoint is vulnerable to SQL injection (an attacker can dump the entire users table), the product review section has stored XSS (malicious scripts execute in admin browsers), and the password reset endpoint has no rate limiting (attackers can brute-force tokens). You implement parameterized queries everywhere, add a strict CSP header to block inline scripts, sanitize all user-generated content before rendering, add rate limiting with exponential backoff to sensitive endpoints, and enable HSTS. The next penetration test passes with zero critical findings.",
        explanation: `## SQL Injection

  SQL injection occurs when untrusted input is concatenated into SQL queries. Attackers can read, modify, or delete data. Prevention: always use parameterized queries (prepared statements) — never string concatenation.

  \`\`\`javascript
  // ❌ Vulnerable
  const query = \`SELECT * FROM users WHERE email = '\${req.body.email}'\`;

  // ✅ Safe — parameterized query
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [req.body.email]);
  \`\`\`

  Use an ORM (Drizzle, Prisma, TypeORM) that handles parameterization automatically. Apply the principle of least privilege to database accounts — the application account should not have DROP or TRUNCATE permissions.

  ## Cross-Site Scripting (XSS)

  XSS injects malicious scripts into web pages. Three types:
  - **Stored XSS**: Script saved on the server (e.g., in a comment)
  - **Reflected XSS**: Script in the URL/request reflected back
  - **DOM-based XSS**: Client-side JS modifies the DOM unsafely

  Prevention: sanitize user input, escape output based on context (HTML entity encoding, JS encoding), use Content Security Policy (CSP) to restrict script sources.

  ## Cross-Site Request Forgery (CSRF)

  CSRF tricks authenticated users into performing unintended actions. Since the browser automatically sends cookies, a malicious site can forge a request. Prevention: CSRF tokens (anti-forgery tokens), SameSite cookies (Strict or Lax), and custom request headers (e.g., X-Requested-By).

  ## HTTPS and TLS

  HTTPS encrypts all communication between client and server. TLS uses asymmetric encryption for the handshake (certificate verification, key exchange) and symmetric encryption for bulk data transfer. Always enforce HTTPS with HSTS (Strict-Transport-Security header).

  ## Content Security Policy (CSP)

  CSP is an HTTP header that restricts which resources can be loaded. It mitigates XSS by blocking inline scripts and limiting script sources.

  \`\`\`
  Content-Security-Policy: default-src 'self'; script-src 'self' cdn.example.com; style-src 'self' 'unsafe-inline'
  \`\`\`

  Deploy in report-only mode (Content-Security-Policy-Report-Only) first to detect violations without breaking functionality.

  ## Input Validation

  Validate all input server-side regardless of client-side validation. Use allowlisting (accept known good patterns) where possible. Validate: type, length, format, range, and presence of expected fields. Libraries like Zod provide declarative schema validation.

  \`\`\`javascript
  import { z } from 'zod';

  const createUserSchema = z.object({
    email: z.string().email(),
    age: z.number().int().min(18).max(120),
    role: z.enum(['user', 'admin']),
  });

  const result = createUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  \`\`\`

  ## IDOR (Insecure Direct Object Reference)

  IDOR occurs when an application exposes direct references to internal objects (user IDs, file paths) without proper authorization checks. Always verify that the requesting user owns or is authorized for the requested resource.

  ## Security Headers Checklist

  - \`Strict-Transport-Security\`: Enforce HTTPS
  - \`Content-Security-Policy\`: Control resource loading
  - \`X-Frame-Options\`: Prevent clickjacking (DENY or SAMEORIGIN)
  - \`X-Content-Type-Options\`: Prevent MIME sniffing (nosniff)
  - \`Referrer-Policy\`: Control referrer information`,
        keyPoints: [
          "SQL injection — always use parameterized queries, never concatenate user input into SQL",
          "XSS — sanitize input, escape output, use CSP to restrict script execution",
          "CSRF — use anti-forgery tokens, SameSite cookies, and custom headers for state-changing requests",
          "HTTPS/TLS — encrypt all traffic, enforce with HSTS header",
          "CSP — defense-in-depth against XSS, deploy in report-only mode first",
          "Input validation — validate server-side with Zod/Joi, use allowlisting, never trust client",
          "IDOR — always authorize access to specific resources, not just authenticate the user",
          "OWASP Top 10 — broken access control, cryptographic failures, and injection are the top risks",
        ],
        tips: [
          "Know concrete examples: demonstrate how SQL injection works with a specific query example",
          "Explain defense in depth: no single control is sufficient — layers of protection are essential",
          "Distinguish between encoding, encryption, and hashing — this is a frequently tested distinction",
          "Discuss CSP report-only mode for safe deployment — shows production experience",
          "Mention OWASP Top 10 early — it signals security awareness and structured knowledge",
        ],
        sampleQuestions: [
          "What is SQL injection and how do you prevent it?",
          "What is XSS (Cross-Site Scripting) and what are its types?",
          "What is CSRF and how does it differ from XSS?",
          "Why is HTTPS important and how does TLS work?",
          "What is Content Security Policy (CSP)?",
          "What is OWASP and why is it important?",
          "What is input validation and why is it critical?",
          "What is the principle of defense in depth?",
          "What are security headers and which ones matter most?",
          "What is IDOR (Insecure Direct Object Reference)?",
          "How do you protect against brute-force attacks?",
          "What is the OWASP Top 10?",
          "What is SSRF (Server-Side Request Forgery)?",
          "How do you handle file uploads securely?",
          "What is the difference between whitelisting and blacklisting in security?",
        ],
      },
    },
    {
      title: "Caching Strategies",
      content: {
        overview:
          "Caching is the single most effective performance optimization for web applications. This chapter covers Redis, CDN caching, HTTP caching headers (Cache-Control, ETag), caching strategies (cache-aside, write-through, write-behind), cache invalidation, TTL management, and distributed caching patterns.",
        realLifeScenario:
          "Your news aggregator API serves 1 million requests per day. The database is at 80% CPU, and p95 response time is 1.2 seconds. You introduce Redis as a cache-aside store: popular articles are cached for 5 minutes, reducing database reads by 90%. You add ETag headers to article endpoints so browsers and CDNs can validate cache freshness without full responses. You implement a CDN (Cloudflare) for static assets and article images, reducing origin load by another 60%. Finally, you add Redis rate limiting to prevent API abuse. Response time drops to 40ms p95, and database CPU drops to 15%.",
        explanation: `## Why Cache?

  Caching stores frequently accessed data in a fast storage layer. It reduces latency (memory vs. disk/network), decreases database load, and improves throughput. The fundamental trade-off: speed vs. freshness.

  ## Cache-Aside (Lazy Loading)

  The application checks the cache first. On a hit, return cached data. On a miss, load from the database, store in cache, and return. Simple and efficient for read-heavy workloads.

  \`\`\`javascript
  async function getUser(id) {
    const cacheKey = \`user:\${id}\`;
    let user = await redis.get(cacheKey);
    if (user) return JSON.parse(user);

    user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    await redis.setex(cacheKey, 300, JSON.stringify(user)); // 5 min TTL
    return user;
  }
  \`\`\`

  Risk: cache stampede when a popular key expires and multiple requests hit the database simultaneously. Mitigate with locks or early recomputation.

  ## Write-Through

  Every write goes to both cache and database in the same transaction. Ensures consistency but adds write latency. Best when reads must always return the latest data.

  ## Write-Behind (Write-Back)

  Writes go to cache first, then asynchronously persist to the database. Very fast writes but risk data loss if the cache fails before persistence. Suitable for analytics, hit counters, and non-critical data.

  ## HTTP Caching

  Browser and CDN caching is the most effective caching layer — it happens before the request even reaches your server.

  \`\`\`
  Cache-Control: public, max-age=3600, must-revalidate
  ETag: "abc123"
  \`\`\`

  - \`Cache-Control: public\`: Allow CDN and browser to cache
  - \`Cache-Control: private\`: Browser cache only (not CDN)
  - \`Cache-Control: no-cache\`: Cache but revalidate with server
  - \`Cache-Control: no-store\`: Do not cache at all
  - \`ETag\`: Version identifier for conditional requests (If-None-Match)
  - \`Last-Modified\`: Timestamp-based validation (If-Modified-Since)

  ## Redis Caching

  Redis is an in-memory data store used for caching, sessions, rate limiting, and pub/sub. Key features: sub-millisecond latency, data structures (strings, hashes, lists, sets, sorted sets), TTL/expiration, LRU/LFU eviction, and persistence (RDB snapshots, AOF logs).

  Redis eviction policies when memory is full: \`allkeys-lru\` (evict least recently used) is most common for caching. \`volatile-ttl\` evicts keys with the shortest TTL. \`noeviction\` returns errors on writes.

  ## CDN Caching

  CDNs (Cloudflare, CloudFront, Akamai) cache content at edge servers close to users. They reduce latency and offload the origin. Cache static assets aggressively (immutable, long max-age). For dynamic content, use Cache-Control headers, surrogate keys, or edge computing (Cloudflare Workers, Lambda@Edge).

  ## Cache Invalidation

  The two hard things in computer science: cache invalidation and naming things. Strategies:
  - **TTL expiration**: Simple but can serve stale data
  - **Explicit invalidation**: Delete/update cache entries on writes
  - **Write-through**: Always consistent but slower writes
  - **Cache tags**: Group related cache entries for bulk invalidation

  \`\`\`javascript
  // Explicit invalidation on update
  async function updateUser(id, data) {
    await db.query('UPDATE users SET ? WHERE id = ?', [data, id]);
    await redis.del(\`user:\${id}\`); // Invalidate cache
  }
  \`\`\`

  ## Stale-While-Revalidate

  Serves stale cached data immediately while asynchronously refreshing the cache. Eliminates the latency penalty of cache misses at the cost of momentarily serving slightly stale data.

  \`\`\`
  Cache-Control: max-age=60, stale-while-revalidate=3600
  \`\`\``,
        keyPoints: [
          "Cache-aside (lazy loading) is the simplest and most common pattern — check cache, miss loads from DB, then cache",
          "Write-through ensures cache-DB consistency at the cost of write latency",
          "Write-behind provides fast writes but risks data loss on cache failure",
          "HTTP Cache-Control headers control browser and CDN caching — public, private, no-cache, no-store",
          "ETags and Last-Modified enable conditional requests that save bandwidth with 304 responses",
          "Redis provides sub-millisecond caching with TTL, eviction policies, and data structures",
          "CDN caching moves content closer to users — critical for global applications",
          "Cache invalidation is the hardest part — use TTL, explicit invalidation, or write-through based on consistency needs",
        ],
        tips: [
          "Know the four main cache strategies (cache-aside, write-through, write-behind, read-through) and their trade-offs",
          "Explain the cache stampede problem and solutions (lock-based regeneration, early recomputation, probabilistic expiration)",
          "Discuss browser vs. CDN vs. server vs. database caching — each layer serves a different purpose",
          "Mention stale-while-revalidate as a modern pattern that balances freshness with performance",
          "Know Redis eviction policies — allkeys-lru is the most common caching choice",
        ],
        sampleQuestions: [
          "What is caching and why is it important?",
          "What is Redis and how is it used for caching?",
          "What is a CDN and how does it improve performance?",
          "Explain the cache-aside strategy.",
          "Explain the write-through caching strategy.",
          "What is TTL (Time To Live) in caching?",
          "What is an ETag and how is it used in HTTP caching?",
          "What is cache invalidation and why is it hard?",
          "What is a cache stampede (cache thundering herd)?",
          "How does browser caching work with Cache-Control headers?",
          "What is the difference between Cache-Control: no-cache and no-store?",
          "What is Redis EVICTION policy?",
          "What is the difference between local cache and distributed cache?",
          "How do you monitor cache performance?",
          "What is stale-while-revalidate?",
        ],
      },
    },
    {
      title: "AI Basics for Backend",
      content: {
        overview:
          "AI integration is now a core backend skill. This chapter covers LLM APIs (OpenAI, Mistral), embeddings, RAG (Retrieval-Augmented Generation), vector databases, prompt engineering, streaming responses, function calling, and production considerations for AI-powered features.",
        realLifeScenario:
          "Your team is building a customer support chatbot that answers product questions using your documentation. You start by sending the entire docset with every prompt — this quickly exceeds token limits and costs $0.50 per query. You implement RAG: chunk the documentation into 256-token segments, generate embeddings with Mistral Embed, store them in pgvector (PostgreSQL), and on each query, retrieve the top-5 relevant chunks. The prompt now includes only relevant context, reducing cost to $0.01 per query and eliminating hallucinations about out-of-scope topics. You add streaming (SSE) so users see responses appear character by character, and implement semantic caching so identical questions are answered from cache in under 50ms.",
        explanation: `## LLM APIs

  Large Language Model APIs provide access to models like GPT-4, Mistral Large, and Claude via HTTP endpoints. Backend integration: protect API keys, construct prompts server-side, handle streaming, implement rate limiting, and manage token usage.

  \`\`\`javascript
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.MISTRAL_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Explain caching strategies.' },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });
  \`\`\`

  Always proxy LLM calls through your backend — never expose API keys to the client.

  ## Embeddings

  Embeddings are dense vector representations of text that capture semantic meaning. Similar texts produce vectors close to each other in embedding space. Generated by embedding models (text-embedding-3-small, Mistral Embed) and stored in vector databases.

  \`\`\`javascript
  const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: 'What is authentication?',
    }),
  });
  \`\`\`

  ## RAG (Retrieval-Augmented Generation)

  RAG grounds LLM responses in factual data retrieved from a knowledge base. The pipeline:
  1. Chunk documents (256-512 tokens with overlap)
  2. Generate embeddings for each chunk
  3. Store in vector DB (Pinecone, Weaviate, pgvector)
  4. On query: embed the query, search top-k similar chunks
  5. Inject chunks as context in the prompt
  6. Send to LLM and return the response

  RAG reduces hallucinations and keeps responses up-to-date without fine-tuning.

  ## Vector Databases

  Vector DBs (pgvector, Pinecone, Qdrant, Weaviate) index vectors for fast similarity search using cosine similarity, Euclidean distance, or dot product. Key operations: nearest neighbor (ANN) search, filtering by metadata, and hybrid search (vector + keyword).

  ## Prompt Engineering

  Design prompts to elicit desired responses. Techniques:
  - **System prompts**: Set behavior and constraints
  - **Few-shot prompting**: Provide examples in the prompt
  - **Chain-of-thought**: Ask for step-by-step reasoning
  - **Output formatting**: Specify JSON or structured output

  \`\`\`javascript
  const systemPrompt = \`You are a senior backend engineer interviewer.
  Answer concisely with code examples.
  If you do not know the answer, say so.
  Format responses in markdown.\`;
  \`\`\`

  ## Streaming

  LLM streaming returns tokens one by one using Server-Sent Events (SSE). The backend streams tokens to the frontend via SSE or WebSocket. Streaming improves perceived responsiveness — users see text appearing as it is generated rather than waiting for the complete response.

  ## Production Considerations

  - **Rate limiting**: Implement token bucket or sliding window for LLM API calls
  - **Caching**: Cache common LLM responses (exact or semantic)
  - **Cost management**: Track token usage per user/feature
  - **Error handling**: Retry with backoff, circuit breakers, fallback responses
  - **Content moderation**: Filter inputs and outputs for harmful content
  - **Hallucination mitigation**: RAG, low temperature, output validation`,
        keyPoints: [
          "LLM APIs are proxied through the backend — never expose API keys to clients",
          "Embeddings are vector representations of text for semantic similarity search",
          "RAG retrieves relevant context from a knowledge base before LLM generation — reduces hallucinations",
          "Vector databases index embeddings for fast nearest-neighbor search using cosine similarity",
          "Prompt engineering: system prompts, few-shot examples, chain-of-thought, and structured output format",
          "Streaming (SSE) delivers LLM responses token-by-token for better UX",
          "Function calling enables LLMs to invoke external tools and APIs",
          "Production AI: rate limiting, caching, cost tracking, error handling, and content moderation",
        ],
        tips: [
          "Explain RAG thoroughly — it is the most asked AI backend topic in interviews",
          "Distinguish RAG from fine-tuning: RAG for knowledge, fine-tuning for behavior/style",
          "Discuss token limits and context window management — shows practical deployment experience",
          "Know the difference between temperature, top-p, and top-k sampling parameters",
          "Mention semantic caching for LLMs — a newer pattern that reduces cost for repeated queries",
        ],
        sampleQuestions: [
          "What are LLM APIs and how do you integrate them into a backend?",
          "What are embeddings in the context of AI/LLMs?",
          "What is RAG (Retrieval-Augmented Generation)?",
          "What is a vector database and how is it used in AI applications?",
          "What is prompt engineering and why is it important?",
          "How does streaming work with LLM APIs?",
          "What is the difference between fine-tuning and RAG?",
          "What are tokens in the context of LLMs?",
          "What is the temperature parameter in LLMs?",
          "What is a system prompt and how is it different from a user prompt?",
          "What is a hallucination in LLMs and how do you mitigate it?",
          "What is prompt injection and how do you prevent it?",
          "What is function calling (tool use) in LLMs?",
          "What is chain-of-thought prompting?",
          "How do you implement a simple RAG pipeline?",
        ],
      },
    },
    {
      title: "Background Jobs & Message Queues",
      content: {
        overview:
          "Background jobs and message queues decouple time-consuming work from the request-response cycle. This chapter covers BullMQ, RabbitMQ, Kafka, pub/sub patterns, retry strategies, dead-letter queues, consumer groups, and production considerations for asynchronous processing at scale.",
        realLifeScenario:
          "Your video processing platform handles 10,000 uploads per day. Each upload requires transcoding to multiple formats (MP4, WebM, HLS), generating thumbnails, extracting metadata, and sending notification emails. Processing a single video takes 2-5 minutes — impossible to do synchronously. You implement BullMQ with Redis: uploads create a job with the video ID and metadata. Workers (separate Node.js processes) pick up jobs, transcode, generate thumbnails, and mark completion. Failed jobs retry with exponential backoff (3 attempts), then move to a dead-letter queue for manual inspection. A second queue handles notifications (email, webhook) with lower priority. The system processes 10,000 daily uploads with zero user-facing latency.",
        explanation: `## Why Message Queues?

  Message queues decouple producers from consumers, enabling asynchronous processing. Benefits: improved user experience (fast responses), load leveling (smooth traffic spikes), fault tolerance (messages persist if consumers fail), and independent scaling of producers and consumers.

  ## BullMQ (Redis-based Job Queue)

  BullMQ is the most popular job queue for Node.js. Jobs are stored in Redis with support for retries, delays, rate limiting, priorities, and job lifecycle events.

  \`\`\`javascript
  import { Queue, Worker } from 'bullmq';

  const queue = new Queue('video-processing');

  // Producer
  async function processVideo(uploadId, userId) {
    await queue.add('transcode', { uploadId, userId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { age: 3600 },
    });
  }

  // Consumer
  const worker = new Worker('video-processing', async (job) => {
    const { uploadId } = job.data;
    // Transcode video, generate thumbnails, etc.
    await transcodeVideo(uploadId);
    return { status: 'completed', uploadId };
  }, {
    concurrency: 5,
    connection: { host: 'localhost', port: 6379 },
  });

  worker.on('completed', (job) => console.log(\`Job \${job.id} completed\`));
  worker.on('failed', (job, err) => console.error(\`Job \${job.id} failed: \${err}\`));
  \`\`\`

  ## RabbitMQ

  RabbitMQ implements the AMQP protocol with flexible routing via exchanges:
  - **Direct exchange**: Routes by exact routing key
  - **Topic exchange**: Pattern-based routing (e.g., "log.*.error")
  - **Fanout exchange**: Broadcasts to all bound queues
  - **Headers exchange**: Routes by message header values

  RabbitMQ supports message persistence, acknowledgments (consumer confirms), dead-letter exchanges, and clustering.

  ## Apache Kafka

  Kafka is a distributed event streaming platform designed for high-throughput, fault-tolerant, replayable event processing. Unlike RabbitMQ (push-based), Kafka uses a pull model where consumers control read rates.

  Key concepts:
  - **Topic**: A named log of events
  - **Partition**: A shard of a topic (ordered, immutable sequence)
  - **Consumer group**: Set of consumers that coordinate to consume partitions
  - **Offset**: Position in the partition (consumers can replay from any offset)
  - **Broker**: A Kafka server in the cluster

  Kafka excels at: event sourcing, log aggregation, stream processing, and metrics collection.

  ## Retry Strategies

  \`\`\`javascript
  // Exponential backoff with jitter
  function getRetryDelay(attempt) {
    const base = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s...
    const jitter = Math.random() * 1000;
    return base + jitter;
  }
  \`\`\`

  - **Fixed retry**: Same delay each attempt
  - **Exponential backoff**: Delay doubles each attempt
  - **Exponential backoff with jitter**: Adds randomness to prevent thundering herd

  After exhausting retries, move the job to a dead-letter queue for manual inspection.

  ## Pub/Sub Pattern

  Publishers send messages to topics/channels without knowing which services subscribe. Subscribers express interest in topics and receive relevant messages. This pattern enables event-driven architectures where services react to events without tight coupling.

  ## Dead-Letter Queue (DLQ)

  A DLQ stores messages that failed processing after retry exhaustion. It prevents message loss and provides a mechanism for debugging persistent failures. Monitor DLQ depth as a health indicator.

  ## Idempotency

  Since at-least-once delivery is standard, duplicates are inevitable. Make message processing idempotent: store processed message IDs in a deduplication store (Redis set with TTL), use idempotency keys, and make DB operations upsert-based.

  \`\`\`javascript
  async function processOrder(message) {
    const processed = await redis.sismember('processed-orders', message.orderId);
    if (processed) return; // Already processed — skip
    await db.transaction(async (tx) => {
      await tx.insert(orders).values(message);
      await redis.sadd('processed-orders', message.orderId);
    });
  }
  \`\`\``,
        keyPoints: [
          "Message queues decouple producers from consumers — enabling async processing, load leveling, and fault tolerance",
          "BullMQ is the standard Node.js job queue — Redis-based, supports retries, delays, priorities, and lifecycle events",
          "RabbitMQ supports flexible routing (direct, topic, fanout, headers) via exchanges and bindings",
          "Kafka is a distributed event log for high-throughput streaming — pull-based, replayable, partitionable",
          "Retries should use exponential backoff with jitter to prevent thundering herd on recovery",
          "Dead-letter queues capture messages that fail after retry exhaustion — critical for operational debugging",
          "Pub/sub enables event-driven architectures with loose coupling between services",
          "Idempotent processing is essential for at-least-once delivery — deduplicate with processed message IDs",
        ],
        tips: [
          "Compare BullMQ vs RabbitMQ vs Kafka explicitly — know each one's strengths and use cases",
          "Explain the difference between job queues (discrete work items) and message queues (general communication)",
          "Discuss consumer groups in Kafka — partition assignment, rebalancing, and parallel consumption",
          "Mention the saga pattern for distributed transactions — shows understanding of async coordination",
          "Always discuss idempotency when talking about message processing — it shows production experience",
        ],
        sampleQuestions: [
          "What is a background job and why is it needed?",
          "What is a message queue and how does it work?",
          "What is Bull (BullMQ) and how is it used in Node.js?",
          "What is RabbitMQ and what messaging patterns does it support?",
          "What is Apache Kafka and how is it different from traditional message queues?",
          "What is the difference between a job queue and a message queue?",
          "What is pub/sub (publish-subscribe) pattern?",
          "How do you implement retries in a job queue?",
          "What is a dead-letter queue (DLQ)?",
          "What is a consumer group in Kafka?",
          "What is the difference between at-least-once and exactly-once delivery?",
          "What is idempotency in the context of message processing?",
          "What is the saga pattern in distributed transactions?",
          "How does backpressure work in message processing?",
          "What is the difference between synchronous and asynchronous communication in microservices?",
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

export const crossCategoryChapters: Record<
  string,
  { title: string; order_index: number }[]
> = {
  "software-engineer": [
    { title: "JavaScript Deep Dive", order_index: 9 },
    { title: "HTML & The DOM", order_index: 10 },
    { title: "Frontend Testing", order_index: 11 },
    { title: "Database Design & Optimization", order_index: 12 },
    { title: "API Design & RESTful Services", order_index: 13 },
    { title: "Authentication & Authorization", order_index: 14 },
    { title: "Security Basics", order_index: 15 },
    { title: "Caching Strategies", order_index: 16 },
    { title: "Node.js & Express.js", order_index: 17 },
    { title: "Spring Boot & Java Ecosystem", order_index: 18 },
  ],
};
