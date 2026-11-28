import type { DsaModule } from "../types";

export const hashingModule: DsaModule = {
  slug: "hashing",
  order: 7,
  part: 1,
  partTitle: "Core data structures",
  title: "Hashing",
  description:
    "Hash functions, collisions, hash maps and sets, and frequency counting.",
  kind: "lesson",
  story:
    "A hash map turns 'does this exist?' from O(n) to O(1). It is the single most useful structure in interview problems.",
  chapters: [
    {
      slug: "hash-functions",
      title: "Hash functions",
      lessonSlug: "hash-functions",
    },
    { slug: "collisions", title: "Collisions", lessonSlug: "collisions" },
    {
      slug: "maps-and-sets",
      title: "Maps & sets",
      lessonSlug: "maps-and-sets",
    },
    {
      slug: "patterns",
      title: "Frequency patterns",
      lessonSlug: "frequency-patterns",
    },
  ],
  lessons: [
    {
      slug: "hash-functions",
      title: "Hash functions",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>A user table holds ten million rows. A login request must answer one question: is this email registered? Scanning the table is ten million string comparisons per request — at a thousand requests per second, ten billion comparisons per second, which no machine can do.</p>
            <p>Sorting the emails once and binary-searching them costs about 24 comparisons per request, but every new signup forces a re-sort or a shift in a sorted array.</p>
            <p>A hash table answers the same question with one array index: turn the email into a number, use that number as a position, and look there. The whole design rests on that turn — the hash function — and on what happens when two different emails turn into the same number.</p>
          `,
        },
        {
          kind: "concept",
          title: "From key to bucket index",
          body: `
            <p>A hash function is a deterministic map from a key to an integer in a fixed range, usually <code>[0, m−1]</code> where <code>m</code> is the number of buckets. Deterministic means the same key always produces the same index; otherwise a stored value could never be found again. The range is fixed because the index addresses an array.</p>
            <p>A common string hash is polynomial: start at 0, and for each character compute <code>h = (h × 31 + code) mod m</code>. Trace <code>"abc"</code> with <code>m = 10</code>. <code>'a'</code> is 97, so <code>h = (0 × 31 + 97) mod 10 = 7</code>. <code>'b'</code> is 98, so <code>h = (7 × 31 + 98) mod 10 = 315 mod 10 = 5</code>. <code>'c'</code> is 99, so <code>h = (5 × 31 + 99) mod 10 = 254 mod 10 = 4</code>. The key <code>"abc"</code> lives in bucket 4.</p>
            <p>The mod at every step is what keeps <code>h</code> inside the range: after each step <code>h &lt; m</code>, so the next product is at most <code>31m + 65,535</code>. In JavaScript that stays exact for any table smaller than about <code>2⁴⁸</code>, because numbers are doubles. In C or Java the same expression overflows a 32-bit int and wraps, which is why Java's <code>String.hashCode</code> is documented as a 32-bit wrapping value.</p>
          `,
        },
        {
          kind: "concept",
          title: "Why the multiplier, and not just a sum",
          body: `
            <p>The naive hash is the sum of character codes. It is fast and it is wrong: <code>"abc"</code> and <code>"cab"</code> both sum to 294, so every anagram lands in the same bucket. A table of English words would degenerate into anagram classes.</p>
            <p>The polynomial form fixes this by weighting each character by its position. At <code>m = 1000</code>, <code>"abc"</code> hashes to 354 and <code>"cab"</code> to 244, because <code>'c'</code> contributes <code>99 × 31²</code> at the front rather than <code>99 × 31⁰</code> at the back.</p>
            <p>The multiplier 31 is a convention, not a law. It is odd and prime, which mixes bits rather than preserving them, and <code>31x = 32x − x</code> can be computed with a shift and a subtract. Java's <code>String.hashCode</code> uses it, and so does the code in this lesson. A power of two would be a poor choice: multiplying by 32 shifts <code>h</code> left, so after the mod the top five bits of the running value are discarded at every step — characters that differ only in those bits stop affecting the index.</p>
            <p>Uniformity is the property that matters, not the constant. A hash is uniform if every bucket receives roughly <code>n/m</code> of <code>n</code> keys. No deterministic hash is uniform for every input — an adversary can always search for keys that collide — which is why production tables randomise part of the function with a per-process seed, and why Java and PHP shipped mitigations after the 2011 hash-flooding disclosure.</p>
          `,
        },
        {
          kind: "concept",
          title: "What it costs, and what it cannot promise",
          body: `
            <p>Hashing a key of length <code>L</code> costs <code>O(L)</code>: one multiply, add and mod per character. A lookup then costs <code>O(1)</code> expected on top of the hash, because the bucket is an array index. Total: <code>O(L)</code> for a string key, <code>O(1)</code> for a fixed-width integer key.</p>
            <p>The <code>O(1)</code> is an average over a uniform hash, and it is worth deriving when it stops holding. With <code>m</code> buckets and <code>k</code> keys, the chance that no two keys collide is about <code>exp(−k(k−1)/(2m))</code>. Setting that to one half gives <code>k ≈ √(2m ln 2) ≈ 1.18√m</code>. A 32-bit hash has <code>m ≈ 4.3 × 10⁹</code>, so collisions become more likely than not at about 77,000 distinct keys. That is the birthday bound, and it is why a 32-bit hash is fine for a hash table but not for identifying content: a repository of 100,000 files has a real chance of two identical hashes.</p>
            <p>Space is <code>O(n + m)</code>: one slot per stored key, plus the bucket array. A table with <code>m</code> much larger than <code>n</code> wastes memory; one with <code>m</code> much smaller than <code>n</code> builds long chains.</p>
          `,
        },
        {
          kind: "concept",
          title: "Where it breaks",
          body: `
            <p>Four failures are worth memorising. First, negative results: JavaScript's <code>%</code> keeps the sign of the dividend, so <code>(-7) % 5</code> is <code>-2</code>, and using that as an index reads <code>arr[-2]</code>. Normalise with <code>((h % m) + m) % m</code>.</p>
            <p>Second, mutable keys: if a key's hash depends on fields that change after insertion, the entry stays in the old bucket and can never be found. Hash keys must be immutable, or the table must be rebuilt.</p>
            <p>Third, the equals contract: two keys with the same hash are not necessarily equal. A lookup must compare keys inside the bucket, not just trust the index. A table that skips that comparison returns the wrong value on a collision.</p>
            <p>Fourth, adversarial input. A public, unseeded hash lets an attacker precompute thousands of colliding keys and turn every <code>O(1)</code> lookup into an <code>O(n)</code> scan. That is a denial of service with no bug in the code — only in the assumption that keys are random.</p>
          `,
        },
        {
          kind: "code",
          title: "Polynomial string hash vs a sum of codes",
          language: "javascript",
          starter: `function hash(str, size) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % size;
  }
  return h;
}

function sumHash(str, size) {
  // TODO: add every character code, then reduce mod size.
  return 0;
}

console.log(hash("abc", 10));`,
          solution: `function hash(str, size) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % size;
  }
  return h;
}

function sumHash(str, size) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h += str.charCodeAt(i);
  return h % size;
}

console.log(hash("abc", 10));`,
          tests: [
            { input: "hash('abc', 10)", expected: "4" },
            { input: "hash('', 10)", expected: "0" },
            { input: "hash('a', 10)", expected: "7" },
            { input: "hash('abc', 1000)", expected: "354" },
            { input: "hash('cab', 1000)", expected: "244" },
            { input: "sumHash('abc', 1000)", expected: "294" },
            {
              input: "sumHash('abc', 1000) === sumHash('cab', 1000)",
              expected: "true",
            },
            {
              input: "hash('abc', 1000) !== hash('cab', 1000)",
              expected: "true",
            },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            'The sum-of-codes hash maps `"abc"` and `"cab"` to the same bucket at every table size. Explain which term of the polynomial hash separates them, then say why multiplying by 32 instead of 31 would be a poor choice for a table whose size is a power of two.',
        },
        {
          kind: "recap",
          points: [
            "A hash function maps a key to a bucket index; it must be deterministic, fast, and spread keys evenly.",
            "The polynomial hash h = (h × 31 + code) mod m weights position, so anagrams do not collide; a plain sum of codes does.",
            "Expected lookup is O(1) after an O(L) hash, but the birthday bound means collisions are certain at scale: about 1.18√m keys gives a 50% chance.",
            "Negative modulo, mutable keys, missing key comparison, and adversarial collisions are the four ways a hash table silently stops being O(1).",
          ],
        },
      ],
      sources: [
        {
          label: "Open Data Structures, ch. 5 — Hash Tables",
          url: "https://opendatastructures.org/ods-java/5_Hash_Tables.html",
        },
        {
          label: "CP-Algorithms — String Hashing",
          url: "https://cp-algorithms.com/string/string-hashing.html",
        },
      ],
      attribution:
        "Synthesis of Open Data Structures ch. 5 (Morin) on multiplicative hashing and CP-Algorithms' string-hashing notes on polynomial hashes.",
    },
    {
      slug: "collisions",
      title: "Collisions",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>A service stores 10,000 sessions in a table with 100 buckets. The hash is the session id's numeric suffix mod 100. If the ids are sequential, each bucket holds about 100 entries. If the ids are timestamps in milliseconds, the last two digits cycle through a fixed pattern and some buckets hold thousands.</p>
            <p>A collision is two keys mapping to one bucket. It is not an error — with 10,000 keys and 100 buckets it is guaranteed by the pigeonhole principle. The engineering question is what the table does next, and what that costs.</p>
          `,
        },
        {
          kind: "concept",
          title: "Chaining: a list per bucket",
          body: `
            <p>Chaining makes each bucket a list. Insert appends to the list at <code>h(k)</code>; lookup scans that list and compares keys. With <code>n</code> keys in <code>m</code> buckets the load factor is <code>α = n/m</code>, so the expected chain length is <code>α</code>: an unsuccessful lookup examines about <code>α</code> entries, a successful one about <code>1 + α/2</code>.</p>
            <p>Trace <code>m = 5</code> with keys 12, 17, 22, 7 and <code>h(k) = k mod 5</code>. All four are congruent to 2 mod 5, so every key lands in bucket 2: one chain of length 4 and four empty buckets. Changing the modulus to 7 spreads them — 12 → 5, 17 → 3, 22 → 1, 7 → 0 — because the keys differ by multiples of 5 and 7 does not divide 5.</p>
            <p>That trace is the argument for a prime table size. When keys are spaced by multiples of <code>d</code>, a table size that shares a factor with <code>d</code> maps them to a small set of buckets; a size coprime to <code>d</code> does not.</p>
          `,
        },
        {
          kind: "concept",
          title: "Open addressing: probe for a slot",
          body: `
            <p>Open addressing stores no lists. The table is an array of slots, and a collision probes the next slot in a fixed sequence. Linear probing uses slot <code>(h(k) + i) mod m</code> for <code>i = 0, 1, 2, …</code>.</p>
            <p>Trace <code>m = 7</code>, <code>h(k) = k mod 7</code>. Insert 12 → slot 5. Insert 17 → slot 3. Insert 22 → slot 1. Insert 19: <code>19 mod 7 = 5</code>, occupied by 12; probe 6, free → slot 6. Insert 26: <code>26 mod 7 = 5</code>, then 6, then 0 → slot 0.</p>
            <p>Lookup 19 starts at 5: 12 is not 19, probe 6, found — two probes. Lookup 26 starts at 5, then 6, then 0 — three probes. Lookup 33, which is absent, starts at 5, then 6, 0, 1, and stops at the empty slot 2 — five probes for a miss.</p>
            <p>The stop condition is the empty slot: in a table with no deletions, an empty slot proves the key is absent, because the key would have been placed there on its probe path. Deletion breaks that proof, which is why open addressing needs tombstones — a deleted slot is marked occupied-but-free so probing continues past it.</p>
          `,
        },
        {
          kind: "concept",
          title: "What probing costs",
          body: `
            <p>The probe count is a function of <code>α</code> alone, not of <code>n</code>. Knuth's formulas for linear probing are <code>½(1 + 1/(1−α))</code> for a successful search and <code>½(1 + 1/(1−α)²)</code> for an unsuccessful one. At <code>α = 0.5</code> that is 1.5 and 2.5 probes. At <code>α = 0.9</code> it is 5.5 and 50.5 — the unsuccessful case explodes because a miss must walk the whole cluster.</p>
            <p>That asymmetry is why open-addressing tables resize at <code>α ≈ 0.7</code> rather than 0.9: past that point the tail latency of a miss dominates. Chaining degrades linearly and gracefully (<code>1 + α</code>); open addressing degrades hyperbolically.</p>
            <p>Resizing doubles <code>m</code> and rehashes every key: <code>O(n)</code> work, amortised <code>O(1)</code> per insertion. The rehash is also the moment to fix a bad hash, since every key is re-inserted.</p>
            <p>Both schemes are <code>O(1)</code> expected and <code>O(n)</code> worst case. The worst case is not hypothetical: a table with a constant hash is a linked list with extra steps.</p>
          `,
        },
        {
          kind: "concept",
          title: "Where it breaks",
          body: `
            <p>Linear probing has primary clustering: a run of occupied slots grows at both ends, and any key hashing into the run extends it. Quadratic probing, <code>(h(k) + c₁i + c₂i²) mod m</code>, breaks primary clusters but not secondary ones — keys with the same home bucket follow the same probe sequence. Double hashing, with step <code>1 + h₂(k) mod (m−1)</code>, gives each key its own sequence and approaches the uniform-hashing ideal.</p>
            <p>Deletion is the classic bug. Setting a slot to empty truncates the probe chain, so a key inserted after a collision becomes unreachable. Tombstones fix lookups but accumulate; when tombstones dominate, the table must be rebuilt.</p>
            <p>Finally, resizing is a latency spike. A million-entry table that doubles at 0.7 load rehashes 700,000 keys in one operation. Incremental rehashing — migrate a few buckets per operation — is how real systems hide that pause.</p>
          `,
        },
        {
          kind: "code",
          title: "A chained hash map with a chain-length probe",
          language: "javascript",
          starter: `class HashMap {
  constructor(size = 8) {
    this.size = size;
    this.buckets = Array.from({ length: size }, () => []);
    this.count = 0;
  }

  hash(key) {
    const s = String(key);
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) % this.size;
    }
    return h;
  }

  set(key, value) {
    // TODO: append to the bucket, or update the existing pair.
  }

  get(key) {
    // TODO: scan the bucket for key and return its value.
  }

  maxChain() {
    // TODO: return the length of the longest bucket.
    return 0;
  }
}`,
          solution: `class HashMap {
  constructor(size = 8) {
    this.size = size;
    this.buckets = Array.from({ length: size }, () => []);
    this.count = 0;
  }

  hash(key) {
    const s = String(key);
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) % this.size;
    }
    return h;
  }

  set(key, value) {
    const bucket = this.buckets[this.hash(key)];
    const pair = bucket.find((p) => p[0] === key);
    if (pair) {
      pair[1] = value;
      return;
    }
    bucket.push([key, value]);
    this.count++;
  }

  get(key) {
    const bucket = this.buckets[this.hash(key)];
    const pair = bucket.find((p) => p[0] === key);
    return pair ? pair[1] : undefined;
  }

  maxChain() {
    return Math.max(...this.buckets.map((b) => b.length));
  }
}`,
          tests: [
            {
              input:
                "(() => { const m = new HashMap(8); m.set('a', 1); return m.get('a'); })()",
              expected: "1",
            },
            {
              input:
                "(() => { const m = new HashMap(8); m.set('a', 1); m.set('a', 2); return [m.get('a'), m.count]; })()",
              expected: "[2,1]",
            },
            {
              input:
                "(() => { const m = new HashMap(8); return m.get('missing'); })()",
              expected: "undefined",
            },
            {
              input:
                "(() => { const m = new HashMap(8); m.set(0, 'zero'); m.set(8, 'eight'); return [m.maxChain(), m.get(0), m.get(8)]; })()",
              expected: '[2,"zero","eight"]',
            },
            {
              input:
                "(() => { const m = new HashMap(4); return m.buckets.length; })()",
              expected: "4",
            },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "A colleague deletes an entry from a linear-probing table by setting the slot to empty. Construct a sequence of three inserts and one delete after which a present key cannot be found, then say what a tombstone changes.",
        },
        {
          kind: "recap",
          points: [
            "Chaining stores a list per bucket; expected lookup is O(1 + α) for load factor α.",
            "Open addressing probes for a free slot; linear probing costs ½(1 + 1/(1−α)) probes on a hit and ½(1 + 1/(1−α)²) on a miss.",
            "Resize at α ≈ 0.7 for open addressing or α ≈ 1 for chaining; the rehash is O(n) and amortises to O(1) per insert.",
            "Deletion needs tombstones, clustering is the probing failure mode, and a constant hash makes every operation O(n).",
          ],
        },
      ],
      sources: [
        {
          label: "Open Data Structures, ch. 5 — Hash Tables",
          url: "https://opendatastructures.org/ods-java/5_Hash_Tables.html",
        },
        {
          label: "VisuAlgo — Hash Table",
          url: "https://visualgo.net/en/hashtable",
        },
      ],
      attribution:
        "Synthesis of Open Data Structures ch. 5 (Morin) on chaining and open addressing, and VisuAlgo's hash-table visualisation.",
    },
    {
      slug: "maps-and-sets",
      title: "Maps & sets",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>A feed endpoint returns 1,000 posts, and the client must render them without duplicates after merging three sources. The naive fix is a nested loop: for each post, scan the result so far. That is 500,000 comparisons for 1,000 posts, and 50 million for 10,000.</p>
            <p>A <code>Set</code> answers "have I seen this id?" in one lookup, so the merge becomes one pass. The same structure answers "does this user follow that tag?", "which of these two lists overlap?", and "how many distinct visitors today?" — all variants of membership, all <code>O(1)</code> expected.</p>
          `,
        },
        {
          kind: "concept",
          title: "A Map is not an object",
          body: `
            <p>JavaScript has two key-value structures, and they are not interchangeable. An object's keys are strings or symbols: <code>o[1]</code> and <code>o["1"]</code> are the same property, and every key is coerced. A <code>Map</code> keeps the key's type: <code>1</code> and <code>"1"</code> are different entries, and an object key is compared by identity.</p>
            <p>Objects also inherit properties. <code>"toString" in {}</code> is true, and <code>{}["toString"]</code> is a function, so a membership test written as <code>if (obj[key])</code> reports true for keys nobody inserted. <code>Map</code> has no prototype chain to leak; if you must use an object, <code>Object.create(null)</code> removes the inherited names.</p>
            <p>Order differs too. <code>Map</code> iterates in insertion order, always. An object iterates integer-like keys in ascending numeric order first, then string keys in insertion order — which is why an object used as a cache can look sorted when you expected insertion order.</p>
            <p>Finally, <code>Map</code> exposes <code>size</code>; an object needs <code>Object.keys(o).length</code>, which is <code>O(n)</code>.</p>
          `,
        },
        {
          kind: "concept",
          title: "Sets and their algebra",
          body: `
            <p>A <code>Set</code> is a <code>Map</code> with no values. Its operations are <code>add</code>, <code>has</code>, <code>delete</code>, and <code>size</code>, all <code>O(1)</code> expected. Construction from an array is <code>O(n)</code> and keeps the first occurrence of each value: <code>[...new Set([3, 1, 3, 2])]</code> is <code>[3, 1, 2]</code>.</p>
            <p>The three set operations are one-liners. Union: <code>new Set([...a, ...b])</code>. Intersection: <code>[...a].filter(x => b.has(x))</code>. Difference: <code>[...a].filter(x => !b.has(x))</code>. Each is <code>O(|a| + |b|)</code> expected, with the caveat that the spread copies the arrays first.</p>
            <p><code>Set</code> membership uses SameValueZero, not <code>===</code>. That means <code>NaN</code> equals <code>NaN</code> inside a <code>Set</code> — <code>new Set([NaN, NaN]).size</code> is 1 — and <code>0</code> and <code>-0</code> are the same key. It also means two structurally equal objects are different keys: <code>new Set([{ id: 1 }, { id: 1 }]).size</code> is 2, because the references differ. Deduplicating objects requires a key function, usually a primitive id.</p>
          `,
        },
        {
          kind: "concept",
          title: "The two-sum pattern",
          body: `
            <p>The canonical <code>Map</code> pattern is two-sum: given <code>nums</code> and <code>target</code>, return the indices of two values that add to <code>target</code>. Sort-and-two-pointers works in <code>O(n log n)</code> but destroys the original indices. A <code>Map</code> does it in one pass.</p>
            <p>Keep a map from value to index. At index <code>i</code>, the value needed is <code>target − nums[i]</code>. If it is already in the map, the answer is <code>[map.get(need), i]</code>. Otherwise store <code>nums[i] → i</code> and continue.</p>
            <p>Trace <code>nums = [2, 7, 11, 15]</code>, <code>target = 9</code>. <code>i = 0</code>: need 7, the map is empty, store <code>2 → 0</code>. <code>i = 1</code>: need 2, the map has 2 at index 0, return <code>[0, 1]</code>. Two iterations, one lookup each.</p>
            <p>The same shape solves subarray-sum-equals-<code>k</code> (map from prefix sum to count), longest substring without repeats (map from character to last index), and group-anagrams (map from signature to group). In every case the map replaces an inner loop with a lookup, turning <code>O(n²)</code> into <code>O(n)</code>.</p>
          `,
        },
        {
          kind: "concept",
          title: "What it costs, and where it breaks",
          body: `
            <p>Every operation is <code>O(1)</code> expected and <code>O(n)</code> worst case, with <code>O(n)</code> space for <code>n</code> entries. The constant is not small: a <code>Map</code> entry carries a key, a value, and a hash, and V8 stores it in a backing table that grows by powers of two. A <code>Set</code> of ten million integers costs hundreds of megabytes; a typed array or a bitset costs tens.</p>
            <p>The failures are predictable. Object identity: <code>{ id: 1 }</code> is never equal to <code>{ id: 1 }</code> as a key. Missing order: a hash map has no sorted iteration, so range queries and "next key" need a sorted structure instead. Mutable keys: changing a field that participates in equality breaks lookup, exactly as it breaks a hash table.</p>
            <p>And the <code>O(1)</code> is expected, not guaranteed. An adversarial key set that collides — or a hash function with poor avalanche — turns the map into a list. For untrusted keys that is a denial-of-service vector, which is why runtimes randomise string hashes.</p>
          `,
        },
        {
          kind: "compare",
          body: `
            <p>A hash map is the default answer to "have I seen this?", but it is the wrong tool for range queries. "All events between 10:00 and 11:00" and "the next key after this one" need sorted order, which a hash table does not have; a balanced tree or a sorted array answers them in <code>O(log n)</code> with no extra per-query memory. Deterministic key order is the same problem in disguise: <code>Map</code> gives insertion order, so two maps built in different orders iterate differently.</p>
            <p>Memory is the third limit. A <code>Map</code> of a million entries carries object overhead per entry; if the keys are dense integers, an array or a <code>Uint32Array</code> indexes directly for a fraction of the cost. And when <code>n</code> is small — under a few dozen — a linear scan often beats a <code>Map</code>, because hashing and allocation dominate the asymptotic difference.</p>
            <p>One structure is worth knowing separately: <code>WeakMap</code> and <code>WeakSet</code> hold their keys weakly, so an entry disappears when the key object is garbage-collected. They are not iterable and have no <code>size</code>, which is exactly the point — they attach metadata to an object without keeping it alive.</p>
          `,
        },
        {
          kind: "code",
          title: "Two-sum, dedupe, and intersection",
          language: "javascript",
          starter: `function twoSum(nums, target) {
  // TODO: one pass with a Map from value to index.
  return [];
}

function unique(arr) {
  // TODO: keep the first occurrence of each value.
  return arr;
}

function intersection(a, b) {
  // TODO: values in both a and b, without duplicates.
  return [];
}`,
          solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

function unique(arr) {
  return [...new Set(arr)];
}

function intersection(a, b) {
  const setB = new Set(b);
  return [...new Set(a)].filter((x) => setB.has(x));
}`,
          tests: [
            { input: "twoSum([2,7,11,15], 9)", expected: "[0,1]" },
            { input: "twoSum([3,3], 6)", expected: "[0,1]" },
            { input: "twoSum([1,2], 5)", expected: "[]" },
            { input: "unique([3,1,3,2,1])", expected: "[3,1,2]" },
            { input: "unique([])", expected: "[]" },
            { input: "intersection([1,2,2,3],[2,3,4])", expected: "[2,3]" },
            { input: "intersection([1],[2])", expected: "[]" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Explain why `new Set([{ id: 1 }, { id: 1 }]).size` is 2 while `new Set([NaN, NaN]).size` is 1. Then rewrite the object case so it deduplicates by id.",
        },
        {
          kind: "recap",
          points: [
            "A Map keeps key types and insertion order; an object coerces keys to strings and inherits prototype names.",
            "Set membership uses SameValueZero: NaN equals NaN, 0 equals -0, and objects compare by identity.",
            "Union, intersection, and difference are O(|a| + |b|) with hash-based filters.",
            "The two-sum pattern — map from value to index, look up the complement — turns an O(n²) scan into O(n).",
          ],
        },
      ],
      sources: [
        {
          label: "Open Data Structures, ch. 5 — Hash Tables",
          url: "https://opendatastructures.org/ods-java/5_Hash_Tables.html",
        },
        {
          label: "Tech Interview Handbook — Hash Table",
          url: "https://www.techinterviewhandbook.org/algorithms/hash-table/",
        },
      ],
      attribution:
        "Synthesis of Open Data Structures ch. 5 (Morin) on the map/set interface and the Tech Interview Handbook's hash-table chapter.",
    },
    {
      slug: "frequency-patterns",
      title: "Frequency patterns",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>An election-night feed must report the winner from a stream of votes as it arrives. Storing every vote and counting at the end is <code>O(n)</code> memory; with 50 million votes that is a large array for one number. A count map is <code>O(distinct candidates)</code> memory, which is small — but the majority element has a solution that uses two variables and one pass.</p>
            <p>The same lesson covers the other frequency patterns: grouping anagrams by signature, finding the <code>k</code> most common values, and locating the first character that appears once.</p>
          `,
        },
        {
          kind: "concept",
          title: "Boyer–Moore majority vote",
          body: `
            <p>If an element appears more than <code>n/2</code> times, it cannot be cancelled out by pairing it against every other element. Boyer–Moore makes that cancellation literal: keep a candidate and a counter. For each value, if the counter is 0, adopt the value as the candidate and set the counter to 1; otherwise increment if the value equals the candidate and decrement if it does not.</p>
            <p>Trace <code>[2, 2, 1, 1, 1, 2, 2]</code>. 2 → candidate 2, count 1. 2 → count 2. 1 → count 1. 1 → count 0. 1 → candidate 1, count 1. 2 → count 0. 2 → candidate 2, count 1. The final candidate is 2, which is correct: it appears four times out of seven.</p>
            <p>The algorithm finds a candidate, not a proof. If no majority exists, the survivor is whatever was left after cancellation — for <code>[1, 2, 3]</code> it is 3, which appears once. A second pass must count the candidate and compare it to <code>n/2</code>. Skipping that pass is the most common bug in interview answers.</p>
            <p>Time is <code>O(n)</code> with two passes, space is <code>O(1)</code>. Any exact majority algorithm must read every vote, so <code>Ω(n)</code> is the lower bound.</p>
          `,
        },
        {
          kind: "concept",
          title: "Anagram signatures",
          body: `
            <p>Two strings are anagrams if they have the same multiset of characters. Grouping them means computing a signature that is equal exactly when the multisets are equal, then using the signature as a <code>Map</code> key.</p>
            <p>The simple signature sorts the characters: <code>"eat" → "aet"</code>, <code>"tea" → "aet"</code>, <code>"ate" → "aet"</code>, while <code>"tan"</code> and <code>"nat"</code> give <code>"ant"</code> and <code>"bat"</code> gives <code>"abt"</code>. One pass over the list builds three groups, in first-seen order. Sorting costs <code>O(k log k)</code> per string of length <code>k</code>, so the total is <code>O(n · k log k)</code>.</p>
            <p>The counting signature is <code>O(k)</code> per string: a 26-slot array of letter counts. But the encoding must be unambiguous. Joining counts with an empty string maps <code>[11, 1, 0, …]</code> and <code>[1, 11, 0, …]</code> to the same <code>"1110…"</code>, so <code>"aaaaaaaaaaab"</code> and <code>"abbbbbbbbbbb"</code> would be grouped as anagrams even though they are not. Join with a separator, or encode each count as a fixed-width pair.</p>
            <p>For lowercase ASCII the 26-slot array is the right tool. For arbitrary Unicode it is wrong: <code>"é"</code> can be one code point or two, and <code>"👍"</code> is a surrogate pair that <code>split("")</code> breaks in half.</p>
          `,
        },
        {
          kind: "concept",
          title: "Top-k and first-unique",
          body: `
            <p>Top-k frequent values has two standard solutions. Count with a <code>Map</code> in <code>O(n)</code>, then either sort the distinct entries by count — <code>O(d log d)</code> for <code>d</code> distinct values — or keep a min-heap of size <code>k</code> and push each entry, popping when it exceeds <code>k</code> — <code>O(d log k)</code>. When <code>k</code> is small the heap wins; when <code>d</code> is small, sorting is simpler and faster in practice.</p>
            <p>A third option is a bucket array indexed by frequency: frequencies range from 1 to <code>n</code>, so an array of <code>n + 1</code> lists sorts the entries in <code>O(n)</code>. That is the counting-sort idea applied to counts, and it is the reason top-k can be linear.</p>
            <p>First-unique-character is the same count map read in a different order: count every character, then scan the string again and return the first index whose count is 1. Two passes, <code>O(n)</code> time, <code>O(alphabet)</code> space. A 26-slot array makes the space <code>O(1)</code> for lowercase ASCII.</p>
          `,
        },
        {
          kind: "concept",
          title: "What it costs, where it breaks",
          body: `
            <p>Counting is <code>O(n)</code> time and <code>O(d)</code> space for <code>d</code> distinct keys. Grouping is <code>O(n · k)</code> to <code>O(n · k log k)</code> depending on the signature. Top-k is <code>O(n + d log k)</code> with a heap or <code>O(n)</code> with buckets.</p>
            <p>The failures are about what counts as "the same key". Unicode normalisation: <code>"é"</code> as U+00E9 and as U+0065 U+0301 are visually identical and compare unequal, so a frequency map sees two keys. Case folding: <code>"The"</code> and <code>"the"</code> are different keys unless you normalise case first. Whitespace and punctuation are part of the key unless you strip them.</p>
            <p>The majority algorithm fails silently when the verification pass is omitted. The anagram signature fails silently when the encoding is ambiguous. Both produce a wrong answer with no error, which is why the tests in this lesson include a no-majority input and two strings that a separator-free count encoding would merge.</p>
          `,
        },
        {
          kind: "code",
          title: "Majority vote and anagram grouping",
          language: "javascript",
          starter: `function majorityElement(nums) {
  // TODO: Boyer-Moore, then verify the candidate.
  return -1;
}

function groupAnagrams(strs) {
  // TODO: group by a sorted-character signature.
  return [];
}`,
          solution: `function majorityElement(nums) {
  let cand = null;
  let count = 0;
  for (const x of nums) {
    if (count === 0) {
      cand = x;
      count = 1;
    } else if (x === cand) {
      count++;
    } else {
      count--;
    }
  }

  let seen = 0;
  for (const x of nums) if (x === cand) seen++;
  return seen > nums.length / 2 ? cand : -1;
}

function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = s.split("").sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}`,
          tests: [
            { input: "majorityElement([2,2,1,1,1,2,2])", expected: "2" },
            { input: "majorityElement([1])", expected: "1" },
            { input: "majorityElement([1,2,3])", expected: "-1" },
            { input: "majorityElement([3,3,4])", expected: "3" },
            {
              input: "groupAnagrams(['eat','tea','tan','ate','nat','bat'])",
              expected: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
            },
            { input: "groupAnagrams([])", expected: "[]" },
            { input: "groupAnagrams(['a'])", expected: '[["a"]]' },
            {
              input: "groupAnagrams(['aaaaaaaaaaab','abbbbbbbbbbb']).length",
              expected: "2",
            },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Boyer–Moore returns 3 for `[1, 2, 3]` even though no majority exists. Explain why the cancellation leaves 3, and describe the second pass that turns the candidate into a verified answer.",
        },
        {
          kind: "recap",
          points: [
            "Boyer–Moore finds a majority candidate in one pass with O(1) space; a second pass must verify it.",
            "Anagram grouping needs a signature that is equal exactly for equal multisets — sorted characters or a separated count encoding.",
            "Top-k is O(n + d log k) with a heap or O(n) with frequency buckets.",
            "Most frequency bugs are key-definition bugs: Unicode normalisation, case, and ambiguous signature encodings.",
          ],
        },
      ],
      sources: [
        {
          label: "Tech Interview Handbook — Hash Table",
          url: "https://www.techinterviewhandbook.org/algorithms/hash-table/",
        },
        {
          label: "VisuAlgo — Hash Table",
          url: "https://visualgo.net/en/hashtable",
        },
      ],
      attribution:
        "Synthesis of the Tech Interview Handbook's hash-table chapter and VisuAlgo's hash-table visualisation.",
    },
  ],
  interviewByte: {
    shape: "When would you use a hash map vs a sorted array?",
    strongAnswer:
      "Hash map for O(1) expected lookup and insert when order does not matter; sorted array for range queries and O(log n) search with no extra memory. Say expected, not guaranteed, and name the worst case.",
    trap: "Ignoring the O(n) worst case of hash maps or the memory overhead.",
  },
  recap: [
    "A hash function maps keys to buckets; it must be deterministic, uniform, and cheap.",
    "Collisions are handled by chaining or open addressing; both are O(1) expected and O(n) worst case.",
    "Maps keep key types and insertion order; sets answer membership and support union, intersection, and difference.",
    "Frequency counting, Boyer–Moore, and anagram signatures cover most easy and medium hash problems.",
  ],
  attribution:
    "Synthesis of Open Data Structures ch. 5, CP-Algorithms string hashing, VisuAlgo, and the Tech Interview Handbook.",
};
