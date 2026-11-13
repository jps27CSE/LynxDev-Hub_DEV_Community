import type { CourseData } from "./types";
import { codeBlock, externalLink, BOX_STYLE } from "./format";

export const sqlCourse: CourseData = {
  title: "Learn SQL — Query Databases From Scratch",
  description:
    "Master the language behind every database. 12 interactive lessons: write real SQL in the browser, hit Run, and watch result tables appear instantly. SQLite-powered, no install needed.",
  icon: "",
  difficulty: "Beginner",
  category: "Backend",
  order_index: 9,
  chapters: [
    {
      title: "1. What Is a Database?",
      content: {
        type: "sql",
        instructions: `
<h2>Data lives in tables</h2>
<p>A <strong>database</strong> is an organized collection of data. The most common kind is a <strong>relational database</strong>: data is stored in <strong>tables</strong> (like spreadsheets), where each row is a record and each column is a field. <strong>SQL</strong> (Structured Query Language) is how you talk to these tables — read, filter, join, and change data.</p>

<h3>Tables, rows, columns</h3>
${codeBlock(`CREATE TABLE students (
  id    INTEGER PRIMARY KEY,
  name  TEXT,
  age   INTEGER,
  grade TEXT
);

INSERT INTO students (name, age, grade) VALUES
  ('Ada',  21, 'A'),
  ('Bob',  19, 'B'),
  ('Cara', 22, 'A'),
  ('Dan',  20, 'C');`)}
<p><code>CREATE TABLE</code> defines the shape; <code>INSERT</code> adds rows. Every table should have a <strong>primary key</strong> — a column (often <code>id</code>) that uniquely identifies each row.</p>

<h3>Your first query</h3>
${codeBlock(`SELECT * FROM students;`)}
<p><code>SELECT</code> reads data, <code>*</code> means "all columns", <code>FROM</code> names the table. Hit <strong>Run</strong> to see all 4 rows.</p>

<h3>Learn more</h3>
<p>${externalLink("SQLite — what is a database", "https://www.sqlite.org/about.html")} · ${externalLink("SQLBolt — intro lesson", "https://sqlbolt.com/lesson/introduction")}</p>

<h3>Your task</h3>
<p>The starter query already selects everything. Modify it to return only the <code>name</code> and <code>grade</code> columns (not <code>*</code>). Watch the result table shrink from 4 columns to 2.</p>
`,
        initialCode: `SELECT * FROM students;`,
        solution: `SELECT name, grade FROM students;`,
        seedSql: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, grade TEXT);
INSERT INTO students (name, age, grade) VALUES ('Ada', 21, 'A'), ('Bob', 19, 'B'), ('Cara', 22, 'A'), ('Dan', 20, 'C');`,
      },
      points_reward: 10,
    },
    {
      title: "2. SELECT & Filtering (WHERE)",
      content: {
        type: "sql",
        instructions: `
<h2>Picking rows: WHERE</h2>
<p><code>SELECT</code> picks columns; <code>WHERE</code> picks rows. Only rows satisfying the condition are returned.</p>
${codeBlock(`SELECT name, age FROM students WHERE age >= 21;`)}
<ul>
  <li><code>=</code>, <code>!=</code> (or <code>&lt;&gt;</code>), <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code> — comparisons</li>
  <li><code>AND</code>, <code>OR</code>, <code>NOT</code> — combine conditions</li>
  <li><code>IN (...)</code>, <code>BETWEEN a AND b</code>, <code>LIKE 'pattern%'</code> — membership / ranges / text matching</li>
  <li><code>IS NULL</code> / <code>IS NOT NULL</code> — null checks (never use <code>= NULL</code>)</li>
</ul>
${codeBlock(`-- students aged 20-22 with grade A or B
SELECT name, age, grade
FROM students
WHERE age BETWEEN 20 AND 22
  AND grade IN ('A', 'B');`)}

<h3>LIKE patterns</h3>
<p><code>%</code> matches any sequence of characters, <code>_</code> matches one character. <code>LIKE 'A%'</code> matches names starting with A.</p>

<h3>Learn more</h3>
<p>${externalLink("SQLite — SELECT", "https://www.sqlite.org/lang_select.html")} · ${externalLink("SQLBolt — filtering", "https://sqlbolt.com/lesson/select_queries_with_constraints")}</p>

<h3>Your task</h3>
<p>Return the names of students who are either 19 years old OR have grade 'A'. Use <code>OR</code>. Columns: <code>name</code>, <code>age</code>, <code>grade</code>.</p>
`,
        initialCode: `SELECT name, age, grade
FROM students
WHERE /* your condition */;`,
        solution: `SELECT name, age, grade
FROM students
WHERE age = 19 OR grade = 'A';`,
        seedSql: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, grade TEXT);
INSERT INTO students (name, age, grade) VALUES ('Ada', 21, 'A'), ('Bob', 19, 'B'), ('Cara', 22, 'A'), ('Dan', 20, 'C');`,
      },
      points_reward: 10,
    },
    {
      title: "3. Sorting & Limiting (ORDER BY, LIMIT)",
      content: {
        type: "sql",
        instructions: `
<h2>Ordering results</h2>
<p>Rows come back in an <em>unspecified</em> order unless you ask. <code>ORDER BY</code> sorts; <code>ASC</code> (default) ascending, <code>DESC</code> descending. Sort by multiple columns: <code>ORDER BY grade, age DESC</code>.</p>
${codeBlock(`SELECT name, grade, age
FROM students
ORDER BY grade ASC, age DESC;`)}

<h2>Limiting results</h2>
<p><code>LIMIT n</code> returns at most n rows; <code>OFFSET k</code> skips the first k. Together they paginate.</p>
${codeBlock(`-- top 2 oldest students
SELECT name, age FROM students ORDER BY age DESC LIMIT 2;

-- page 2 (rows 3-4) of 2-per-page
SELECT name, age FROM students ORDER BY name LIMIT 2 OFFSET 2;`)}

<h3>DISTINCT</h3>
<p><code>SELECT DISTINCT grade FROM students;</code> removes duplicate values — useful for "what distinct values exist?".</p>

<h3>Learn more</h3>
<p>${externalLink("SQLite — ORDER BY", "https://www.sqlite.org/lang_select.html#ordering")} · ${externalLink("W3Schools — LIMIT", "https://www.w3schools.com/sql/sql_top.asp")}</p>

<h3>Your task</h3>
<p>Return the 2 youngest students (by age, ascending), showing <code>name</code> and <code>age</code>. If ties, break by name ascending.</p>
`,
        initialCode: `SELECT name, age
FROM students
ORDER BY /* ? */
LIMIT /* ? */;`,
        solution: `SELECT name, age
FROM students
ORDER BY age ASC, name ASC
LIMIT 2;`,
        seedSql: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, grade TEXT);
INSERT INTO students (name, age, grade) VALUES ('Ada', 21, 'A'), ('Bob', 19, 'B'), ('Cara', 22, 'A'), ('Dan', 20, 'C');`,
      },
      points_reward: 10,
    },
    {
      title: "4. Aggregates & GROUP BY",
      content: {
        type: "sql",
        instructions: `
<h2>Summarizing data</h2>
<p><strong>Aggregate functions</strong> collapse many rows into one value:</p>
<ul>
  <li><code>COUNT(*)</code> — number of rows</li>
  <li><code>SUM(col)</code>, <code>AVG(col)</code> — totals and averages</li>
  <li><code>MIN(col)</code>, <code>MAX(col)</code> — extremes</li>
</ul>
${codeBlock(`SELECT COUNT(*) AS total, AVG(age) AS avg_age, MIN(age) AS youngest
FROM students;`)}

<h2>GROUP BY</h2>
<p><code>GROUP BY</code> aggregates <em>per group</em>. Every non-aggregated column in SELECT must appear in GROUP BY.</p>
${codeBlock(`SELECT grade, COUNT(*) AS num_students, AVG(age) AS avg_age
FROM students
GROUP BY grade
ORDER BY num_students DESC;`)}

<h2>HAVING</h2>
<p><code>WHERE</code> filters rows before grouping; <code>HAVING</code> filters groups after. Use <code>HAVING</code> with aggregates.</p>
${codeBlock(`SELECT grade, COUNT(*) AS n
FROM students
GROUP BY grade
HAVING COUNT(*) >= 2;`)}

<h3>Learn more</h3>
<p>${externalLink("SQLite — aggregate functions", "https://www.sqlite.org/lang_aggfunc.html")} · ${externalLink("Mode — GROUP BY", "https://mode.com/sql-tutorial/sql-group-by/")}</p>

<h3>Your task</h3>
<p>For each grade, show the grade and the number of students with that grade, but only for grades that have at least 2 students. Columns: <code>grade</code>, <code>num_students</code>.</p>
`,
        initialCode: `SELECT grade, COUNT(*) AS num_students
FROM students
GROUP BY grade
/* filter groups with >= 2 */;`,
        solution: `SELECT grade, COUNT(*) AS num_students
FROM students
GROUP BY grade
HAVING COUNT(*) >= 2;`,
        seedSql: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, grade TEXT);
INSERT INTO students (name, age, grade) VALUES ('Ada', 21, 'A'), ('Bob', 19, 'B'), ('Cara', 22, 'A'), ('Dan', 20, 'C'), ('Eve', 18, 'B');`,
      },
      points_reward: 10,
    },
    {
      title: "5. JOINs",
      content: {
        type: "sql",
        instructions: `
<h2>Combining tables</h2>
<p>Real data is split across tables to avoid duplication. <strong>JOIN</strong> combines them on a matching key. <code>INNER JOIN</code> returns only rows that match in both tables.</p>
${codeBlock(`SELECT a.name AS author, b.title
FROM authors a
JOIN books b ON b.author_id = a.id;`)}

<h3>LEFT JOIN</h3>
<p><code>LEFT JOIN</code> keeps <em>all</em> rows from the left table, filling <code>NULL</code> where there's no match on the right. Great for "show me everything, even if missing related data".</p>
${codeBlock(`SELECT a.name, COUNT(b.id) AS num_books
FROM authors a
LEFT JOIN books b ON b.author_id = a.id
GROUP BY a.id, a.name;`)}

<h3>Aliases & USING</h3>
<p>Alias tables (<code>authors a</code>) for shorter queries. If both tables share a column name, <code>JOIN ... USING (id)</code> is a tidy shortcut.</p>

<h3>Learn more</h3>
<p>${externalLink("SQLite — JOIN", "https://www.sqlite.org/lang_select.html#joins")} · ${externalLink("SQLBolt — JOINs", "https://sqlbolt.com/lesson/select_queries_with_joins")}</p>

<h3>Your task</h3>
<p>List every author and the number of books they've written, including authors with zero books. Columns: <code>author</code>, <code>num_books</code>. Sort by <code>num_books</code> descending.</p>
`,
        initialCode: `SELECT a.name AS author, COUNT(b.id) AS num_books
FROM authors a
/* join books */ 
GROUP BY a.id, a.name
ORDER BY num_books DESC;`,
        solution: `SELECT a.name AS author, COUNT(b.id) AS num_books
FROM authors a
LEFT JOIN books b ON b.author_id = a.id
GROUP BY a.id, a.name
ORDER BY num_books DESC;`,
        seedSql: `CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER);
INSERT INTO authors (name) VALUES ('Ada'), ('Bob'), ('Cara');
INSERT INTO books (title, author_id) VALUES ('SQL 101', 1), ('Deep Joins', 1), ('Poems', 3);`,
      },
      points_reward: 10,
    },
    {
      title: "6. Subqueries & CTEs (WITH)",
      content: {
        type: "sql",
        instructions: `
<h2>Queries inside queries</h2>
<p>A <strong>subquery</strong> is a SELECT nested inside another statement — in <code>WHERE</code>, <code>FROM</code>, or <code>SELECT</code>. Use it when you need a value computed from data.</p>
${codeBlock(`-- books priced above the average
SELECT title, price
FROM books
WHERE price > (SELECT AVG(price) FROM books);`)}

<h2>CTEs (WITH)</h2>
<p>A <strong>Common Table Expression</strong> names a subquery so the main query stays readable. Great for multi-step logic.</p>
${codeBlock(`WITH expensive AS (
  SELECT title, price FROM books WHERE price > 20
)
SELECT * FROM expensive ORDER BY price DESC;`)}

<h3>Multiple CTEs</h3>
${codeBlock(`WITH
  totals AS (SELECT customer_id, SUM(amount) AS spent FROM orders GROUP BY customer_id),
  vip    AS (SELECT customer_id FROM totals WHERE spent > 100)
SELECT c.name FROM customers c JOIN vip v ON v.customer_id = c.id;`)}

<h3>Learn more</h3>
<p>${externalLink("SQLite — WITH clause", "https://www.sqlite.org/lang_with.html")} · ${externalLink("Mode — subqueries", "https://mode.com/sql-tutorial/sql-subqueries/")}</p>

<h3>Your task</h3>
<p>Using a CTE named <code>dept_avg</code>, compute the average salary per department, then return departments whose average salary is above 60000. Columns: <code>department</code>, <code>avg_salary</code>, sorted descending.</p>
`,
        initialCode: `WITH dept_avg AS (
  SELECT department, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY department
)
SELECT department, avg_salary
FROM dept_avg
WHERE /* condition */
ORDER BY avg_salary DESC;`,
        solution: `WITH dept_avg AS (
  SELECT department, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY department
)
SELECT department, avg_salary
FROM dept_avg
WHERE avg_salary > 60000
ORDER BY avg_salary DESC;`,
        seedSql: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
INSERT INTO employees (name, department, salary) VALUES ('Ada', 'Eng', 90000), ('Bob', 'Eng', 85000), ('Cara', 'Sales', 50000), ('Dan', 'Sales', 55000), ('Eve', 'HR', 62000);`,
      },
      points_reward: 10,
    },
    {
      title: "7. INSERT, UPDATE, DELETE (DML)",
      content: {
        type: "sql",
        instructions: `
<h2>Changing data</h2>
<p><strong>DML</strong> (Data Manipulation Language) modifies rows. Always include a <code>WHERE</code> on UPDATE/DELETE unless you truly want to touch every row.</p>
${codeBlock(`INSERT INTO products (name, price, stock) VALUES ('Pen', 1.5, 100);

UPDATE products SET price = price * 1.1 WHERE name = 'Pen';

DELETE FROM products WHERE stock = 0;`)}

<h3>INSERT ... SELECT</h3>
<p>Copy rows from one table to another:</p>
${codeBlock(`INSERT INTO archive (name, price)
SELECT name, price FROM products WHERE discontinued = 1;`)}

<h3>RETURNING</h3>
<p>SQLite (and Postgres) support <code>RETURNING</code> to get the affected rows back:</p>
${codeBlock(`INSERT INTO products (name, price) VALUES ('Eraser', 0.5) RETURNING id, name;`)}

<h3>Safety habits</h3>
<ul>
  <li>Run a <code>SELECT</code> with the same <code>WHERE</code> first to preview what will change.</li>
  <li>Wrap multi-statement changes in a <code>TRANSACTION</code> (next chapter) so you can roll back.</li>
  <li>Never run <code>UPDATE</code>/<code>DELETE</code> without <code>WHERE</code> in production.</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("SQLite — INSERT", "https://www.sqlite.org/lang_insert.html")} · ${externalLink("SQLite — UPDATE", "https://www.sqlite.org/lang_update.html")}</p>

<h3>Your task</h3>
<p>Insert a new product named 'Notebook' with price 4.0 and stock 50, then update its price to 4.5. Run both statements (separate with a semicolon). The final SELECT should show the notebook row.</p>
`,
        initialCode: `INSERT INTO products (name, price, stock) VALUES (/* ? */);

UPDATE products SET price = /* ? */ WHERE name = 'Notebook';

SELECT * FROM products WHERE name = 'Notebook';`,
        solution: `INSERT INTO products (name, price, stock) VALUES ('Notebook', 4.0, 50);

UPDATE products SET price = 4.5 WHERE name = 'Notebook';

SELECT * FROM products WHERE name = 'Notebook';`,
        seedSql: `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL, stock INTEGER);
INSERT INTO products (name, price, stock) VALUES ('Pen', 1.5, 100), ('Pencil', 0.5, 200);`,
      },
      points_reward: 10,
    },
    {
      title: "8. Schema Design (DDL)",
      content: {
        type: "sql",
        instructions: `
<h2>Designing tables</h2>
<p><strong>DDL</strong> (Data Definition Language) creates and alters structure. Good schema design means choosing the right columns, types, and constraints.</p>
${codeBlock(`CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);`)}

<h3>Constraints</h3>
<ul>
  <li><code>PRIMARY KEY</code> — unique identity for each row</li>
  <li><code>NOT NULL</code> — value required</li>
  <li><code>UNIQUE</code> — no duplicates (emails, usernames)</li>
  <li><code>DEFAULT</code> — value used when omitted</li>
  <li><code>CHECK (age >= 0)</code> — custom validation</li>
  <li><code>FOREIGN KEY (author_id) REFERENCES authors(id)</code> — link tables</li>
</ul>

<h3>Data types (SQLite affinity)</h3>
<p>SQLite uses type <em>affinity</em>, not strict types: <code>INTEGER</code>, <code>TEXT</code>, <code>REAL</code>, <code>BLOB</code>, <code>NUMERIC</code>. Storing text in an INTEGER column still works (SQLite is flexible) — but be consistent.</p>

<h3>ALTER TABLE</h3>
${codeBlock(`ALTER TABLE users ADD COLUMN bio TEXT;
-- (SQLite supports ADD COLUMN; renaming/dropping needs table rebuild)`)}

<h3>Learn more</h3>
<p>${externalLink("SQLite — CREATE TABLE", "https://www.sqlite.org/lang_createtable.html")} · ${externalLink("SQLite — foreign keys", "https://www.sqlite.org/foreignkeys.html")}</p>

<h3>Your task</h3>
<p>Create a <code>books</code> table with: <code>id</code> (integer primary key), <code>title</code> (text, not null), <code>author_id</code> (integer, foreign key to <code>authors(id)</code>), <code>price</code> (real, default 0), and a CHECK that price >= 0. Then insert one book.</p>
`,
        initialCode: `CREATE TABLE books (
  id        INTEGER PRIMARY KEY,
  title     TEXT NOT NULL,
  author_id INTEGER REFERENCES authors(id),
  price     REAL DEFAULT 0 CHECK (price >= 0)
);

INSERT INTO books (title, author_id, price) VALUES ('SQL 101', 1, 29.99);

SELECT * FROM books;`,
        solution: `CREATE TABLE books (
  id        INTEGER PRIMARY KEY,
  title     TEXT NOT NULL,
  author_id INTEGER REFERENCES authors(id),
  price     REAL DEFAULT 0 CHECK (price >= 0)
);

INSERT INTO books (title, author_id, price) VALUES ('SQL 101', 1, 29.99);

SELECT * FROM books;`,
        seedSql: `CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO authors (name) VALUES ('Ada'), ('Bob');`,
      },
      points_reward: 10,
    },
    {
      title: "9. Indexes & Performance",
      content: {
        type: "sql",
        instructions: `
<h2>Making queries fast</h2>
<p>An <strong>index</strong> is a separate lookup structure (like a book's index) that speeds up <code>WHERE</code>, <code>JOIN</code>, and <code>ORDER BY</code> on a column — at the cost of slower writes and extra storage.</p>
${codeBlock(`CREATE INDEX idx_employees_department ON employees(department);

-- now this is fast:
SELECT * FROM employees WHERE department = 'Eng';`)}

<h3>When to index</h3>
<ul>
  <li>Columns used in <code>WHERE</code>, <code>JOIN ON</code>, <code>ORDER BY</code>, <code>GROUP BY</code></li>
  <li>Foreign keys</li>
  <li>Don't index tiny tables or columns rarely queried</li>
  <li>Don't over-index — each index slows INSERT/UPDATE/DELETE</li>
</ul>

<h3>EXPLAIN QUERY PLAN</h3>
<p>Ask SQLite how it will execute a query. Look for <code>USING INDEX</code> vs <code>SCAN TABLE</code>.</p>
${codeBlock(`EXPLAIN QUERY PLAN
SELECT * FROM employees WHERE department = 'Eng';

-- after creating the index, re-run: should say "SEARCH ... USING INDEX"`)}

<h3>Composite indexes</h3>
<p><code>CREATE INDEX idx ON t(a, b);</code> helps queries filtering on <code>a</code>, or <code>a AND b</code>, but not <code>b</code> alone (leftmost prefix rule).</p>

<h3>Learn more</h3>
<p>${externalLink("SQLite — CREATE INDEX", "https://www.sqlite.org/lang_createindex.html")} · ${externalLink("SQLite — EXPLAIN", "https://www.sqlite.org/lang_explain.html")}</p>

<h3>Your task</h3>
<p>Create an index on <code>employees(department)</code>, then run the EXPLAIN QUERY PLAN for <code>SELECT * FROM employees WHERE department = 'Eng'</code>. Confirm the plan uses the index.</p>
`,
        initialCode: `CREATE INDEX idx_emp_department ON employees(department);

EXPLAIN QUERY PLAN
SELECT * FROM employees WHERE department = 'Eng';`,
        solution: `CREATE INDEX idx_emp_department ON employees(department);

EXPLAIN QUERY PLAN
SELECT * FROM employees WHERE department = 'Eng';`,
        seedSql: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
INSERT INTO employees (name, department, salary) VALUES ('Ada', 'Eng', 90000), ('Bob', 'Eng', 85000), ('Cara', 'Sales', 50000), ('Dan', 'Sales', 55000), ('Eve', 'HR', 62000);`,
      },
      points_reward: 10,
    },
    {
      title: "10. Normalization",
      content: {
        type: "sql",
        instructions: `
<h2>Avoiding duplication</h2>
<p><strong>Normalization</strong> is organizing tables so each fact is stored once. Redundancy causes update anomalies (change a customer's address in 10 rows and miss one).</p>

<h3>1NF — atomic values, no repeating groups</h3>
<p>Bad: <code>orders(id, customer, items="pen,pencil")</code>. Good: a separate <code>order_items</code> table with one row per item.</p>

<h3>2NF — no partial dependencies</h3>
<p>In a composite-key table, every non-key column must depend on the <em>whole</em> key, not part of it.</p>

<h3>3NF — no transitive dependencies</h3>
<p>Non-key columns must depend only on the key, not on another non-key column. If <code>employee → department → department_head</code>, move <code>department_head</code> to a <code>departments</code> table.</p>

<h3>When to denormalize</h3>
<p>Pure 3NF can require many joins. For read-heavy analytics, a denormalized (flat) table is often faster. Normalize for writes, denormalize for reads — and know the trade-off.</p>

${codeBlock(`-- normalized: two tables
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, total REAL,
  FOREIGN KEY (customer_id) REFERENCES customers(id));`)}

<h3>Learn more</h3>
<p>${externalLink("W3Schools — normalization", "https://www.w3schools.com/sql/sql_normalization.asp")} · ${externalLink("PostgreSQL docs — constraints", "https://www.postgresql.org/docs/current/ddl-constraints.html")}</p>

<h3>Your task</h3>
<p>The starter has a denormalized <code>orders_flat</code> table (customer name + city repeated per order). Write a SELECT that returns each distinct customer with their city (deduplicated) — the first step toward normalizing. Columns: <code>customer</code>, <code>city</code>.</p>
`,
        initialCode: `SELECT DISTINCT customer, city
FROM orders_flat
ORDER BY customer;`,
        solution: `SELECT DISTINCT customer, city
FROM orders_flat
ORDER BY customer;`,
        seedSql: `CREATE TABLE orders_flat (id INTEGER PRIMARY KEY, customer TEXT, city TEXT, total REAL);
INSERT INTO orders_flat (customer, city, total) VALUES ('Ada', 'NYC', 10.0), ('Ada', 'NYC', 20.0), ('Bob', 'LA', 5.0);`,
      },
      points_reward: 10,
    },
    {
      title: "11. Transactions & ACID",
      content: {
        type: "sql",
        instructions: `
<h2>All-or-nothing changes</h2>
<p>A <strong>transaction</strong> groups multiple statements so they succeed or fail together. If one fails, the others roll back. This is the <strong>A</strong>tomicity in ACID.</p>
${codeBlock(`BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;`)}

<h3>ROLLBACK</h3>
<p>If something goes wrong mid-transaction, <code>ROLLBACK</code> undoes everything since <code>BEGIN</code>.</p>
${codeBlock(`BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- oops, insufficient funds detected
ROLLBACK;`)}

<h3>ACID</h3>
<ul>
  <li><strong>A</strong>tomicity — all or nothing</li>
  <li><strong>C</strong>onsistency — constraints hold before and after</li>
  <li><strong>I</strong>solation — concurrent transactions don't interfere</li>
  <li><strong>D</strong>urability — committed data survives crashes</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("SQLite — transactions", "https://www.sqlite.org/lang_transaction.html")} · ${externalLink("PostgreSQL — ACID", "https://www.postgresql.org/docs/current/tutorial-transactions.html")}</p>

<h3>Your task</h3>
<p>Transfer 50 from account 1 to account 2 using a transaction: BEGIN, two UPDATEs, COMMIT. Then SELECT both accounts to verify.</p>
`,
        initialCode: `BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
COMMIT;

SELECT * FROM accounts;`,
        solution: `BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
COMMIT;

SELECT * FROM accounts;`,
        seedSql: `CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance REAL);
INSERT INTO accounts (name, balance) VALUES ('Ada', 200.0), ('Bob', 100.0);`,
      },
      points_reward: 10,
    },
    {
      title: "12. Project — Library Database",
      content: {
        type: "sql",
        instructions: `
<h2>Project: query a library database</h2>
<p>Combine everything: JOINs, aggregates, GROUP BY, ORDER BY, filtering. The database has <code>authors</code>, <code>books</code>, <code>members</code>, and <code>loans</code>. Write queries to answer real questions.</p>

<h3>Schema</h3>
${codeBlock(`authors(id, name)
books(id, title, author_id, year)
members(id, name, joined)
loans(id, book_id, member_id, loan_date, return_date)`)}

<h3>Challenge queries (try them all)</h3>
<ol>
  <li>All books with their author's name (JOIN).</li>
  <li>How many books each author has written (GROUP BY + COUNT).</li>
  <li>Members who currently have a book out (return_date IS NULL).</li>
  <li>The most-borrowed book (GROUP BY + ORDER BY + LIMIT).</li>
  <li>Average publication year of borrowed books.</li>
</ol>

<div style="${BOX_STYLE}"><strong>Tip:</strong> solve one challenge at a time. Use <code>SHOW SOLUTION</code> only after you've tried. There's no single right answer — compare row counts.</div>

<h3>Starter</h3>
<p>The starter returns all loans with book and member names. Extend it: count how many books each member has ever borrowed, sorted descending.</p>
`,
        initialCode: `-- Starter: all loans with book + member names
SELECT m.name AS member, b.title AS book, l.loan_date, l.return_date
FROM loans l
JOIN books b ON b.id = l.book_id
JOIN members m ON m.id = l.member_id
ORDER BY l.loan_date;

-- Your turn: count books borrowed per member (descending)`,
        solution: `SELECT m.name AS member, COUNT(*) AS books_borrowed
FROM loans l
JOIN members m ON m.id = l.member_id
GROUP BY m.id, m.name
ORDER BY books_borrowed DESC;`,
        seedSql: `CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER, year INTEGER);
CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT, joined TEXT);
CREATE TABLE loans (id INTEGER PRIMARY KEY, book_id INTEGER, member_id INTEGER, loan_date TEXT, return_date TEXT);
INSERT INTO authors (name) VALUES ('Ada'), ('Bob'), ('Cara');
INSERT INTO books (title, author_id, year) VALUES ('SQL 101', 1, 2020), ('Deep Joins', 1, 2022), ('Poems', 3, 2018), ('History', 2, 2015);
INSERT INTO members (name, joined) VALUES ('Zoe', '2023-01-01'), ('Tom', '2023-02-01'), ('Mia', '2023-03-01');
INSERT INTO loans (book_id, member_id, loan_date, return_date) VALUES (1, 1, '2024-01-01', '2024-01-10'), (2, 1, '2024-02-01', NULL), (3, 2, '2024-01-15', '2024-01-20'), (1, 3, '2024-03-01', NULL), (4, 2, '2024-03-05', NULL);`,
      },
      points_reward: 25,
    },
  ],
};
