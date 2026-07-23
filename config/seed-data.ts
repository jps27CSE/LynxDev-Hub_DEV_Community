import { allCourses } from "./courses";

const aiCoursesData = [
  {
    title: "Generative AI & LLM Fundamentals",
    description:
      "Understand how LLMs work, what happens behind ChatGPT, and the core concepts of Generative AI — from tokens to transformers.",
    icon: "🧠",
    difficulty: "Beginner",
    category: "AI",
    order_index: 9,
    chapters: [
      {
        title: "What is Generative AI?",
        content: {
          instructions:
            "Generative AI refers to AI models that can generate new content — text, images, code, and more. Unlike traditional AI that classifies or predicts, Generative AI creates.\n\n## Key Concepts\n- **LLM (Large Language Model)**: A model trained on massive text data\n- **Tokens**: The smallest unit of text an LLM processes\n- **Context Window**: How much text the model can see at once\n\n## Your Task\nCreate a simple function that counts tokens in a given text (approximate by splitting on spaces).",
          initialCode:
            "function countTokens(text) {\n  // Your code here\n  return 0;\n}\n\nconsole.log(countTokens('Hello, how are you?'));",
          solution:
            "function countTokens(text) {\n  return text.split(' ').length;\n}\n\nconsole.log(countTokens('Hello, how are you?'));",
        },
        points_reward: 10,
      },
      {
        title: "How LLMs Actually Work",
        content: {
          instructions:
            "LLMs predict the next word based on the words that came before. They are trained on billions of text examples and learn patterns in language.\n\n## The Process\n1. Text is broken into tokens\n2. Each token is converted to a vector (embedding)\n3. The model processes these through transformer layers\n4. Output probabilities for the next token are generated\n\n## Your Task\nCreate a function that simulates next-token prediction by returning the most common next word from a predefined list.",
          initialCode:
            "function predictNextWord(context, vocabulary) {\n  // Return the most likely next word\n}\n\nconst vocab = ['is', 'are', 'was', 'were', 'will', 'can'];\nconsole.log(predictNextWord('The cat', vocab));",
          solution:
            "function predictNextWord(context, vocabulary) {\n  return vocabulary[0];\n}\n\nconst vocab = ['is', 'are', 'was', 'were', 'will', 'can'];\nconsole.log(predictNextWord('The cat', vocab));",
        },
        points_reward: 10,
      },
    ],
  },
  {
    title: "LangChain for Beginners",
    description:
      "Learn LangChain from scratch — models, prompts, chains, memory, and structured output. Build your first AI-powered application.",
    icon: "⛓️",
    difficulty: "Beginner",
    category: "AI",
    order_index: 10,
    chapters: [
      {
        title: "What is LangChain?",
        content: {
          instructions:
            "LangChain is a framework for building AI-powered applications. It provides a unified interface to work with different LLM providers, create chains, manage prompts, and more.\n\n## Core Components\n- **Models**: Interface with LLMs (OpenAI, Gemini, Groq, etc.)\n- **Prompts**: Templates for structuring inputs\n- **Chains**: Sequences of operations\n- **Memory**: Persist conversation state\n\n## Your Task\nCreate a simple chain function that takes a prompt template and formats it with given variables.",
          initialCode:
            "function formatPrompt(template, variables) {\n  // Replace {{variable}} with actual values\n}\n\nconst template = 'Explain {{topic}} in simple terms.';\nconsole.log(formatPrompt(template, { topic: 'LangChain' }));",
          solution:
            "function formatPrompt(template, variables) {\n  return template.replace(/{{(\\w+)}}/g, (_, key) => variables[key]);\n}\n\nconst template = 'Explain {{topic}} in simple terms.';\nconsole.log(formatPrompt(template, { topic: 'LangChain' }));",
        },
        points_reward: 10,
      },
      {
        title: "Prompt Templates & Structured Output",
        content: {
          instructions:
            "Prompt Templates let you create reusable prompts. Structured Output ensures the AI returns data in a predictable format like JSON.\n\n## Why Use Templates?\n- Consistency across different calls\n- Reusability\n- Separation of concerns\n\n## Your Task\nCreate a prompt template that extracts structured data (name, age, city) from a text description.",
          initialCode:
            "function extractPersonInfo(text) {\n  // Return { name: '', age: null, city: '' }\n}\n\nconsole.log(extractPersonInfo('John is 25 years old and lives in New York.'));",
          solution:
            "function extractPersonInfo(text) {\n  const nameMatch = text.match(/^([A-Za-z]+)/);\n  const ageMatch = text.match(/(\\d+)/);\n  const cityMatch = text.match(/lives in ([A-Za-z ]+)/);\n  return {\n    name: nameMatch ? nameMatch[1] : '',\n    age: ageMatch ? parseInt(ageMatch[1]) : null,\n    city: cityMatch ? cityMatch[1] : '',\n  };\n}\n\nconsole.log(extractPersonInfo('John is 25 years old and lives in New York.'));",
        },
        points_reward: 15,
      },
    ],
  },
  {
    title: "Building RAG Applications",
    description:
      "Master Retrieval-Augmented Generation — document loading, text splitting, embeddings, vector stores, and building a complete RAG chatbot.",
    icon: "📚",
    difficulty: "Intermediate",
    category: "AI",
    order_index: 11,
    chapters: [
      {
        title: "RAG Explained",
        content: {
          instructions:
            "RAG (Retrieval-Augmented Generation) enhances LLM responses by retrieving relevant information from external documents before generating an answer.\n\n## The RAG Pipeline\n1. Load documents (PDFs, text files, web pages)\n2. Split into chunks\n3. Generate embeddings for each chunk\n4. Store in a vector database\n5. When a question comes in, find similar chunks\n6. Send chunks + question to the LLM\n\n## Your Task\nSimulate a simple RAG pipeline: given a set of documents and a query, find the most relevant document by keyword matching.",
          initialCode:
            "function searchDocuments(docs, query) {\n  // Return docs sorted by relevance\n}\n\nconst docs = [\n  'LangChain is a framework for LLM apps',\n  'RAG stands for Retrieval-Augmented Generation',\n  'Embeddings convert text to vectors'\n];\nconsole.log(searchDocuments(docs, 'What is RAG?'));",
          solution:
            "function searchDocuments(docs, query) {\n  const keywords = query.toLowerCase().split(' ');\n  return docs\n    .map(doc => ({\n      doc,\n      score: keywords.filter(k => doc.toLowerCase().includes(k)).length\n    }))\n    .sort((a, b) => b.score - a.score)\n    .map(item => item.doc);\n}\n\nconst docs = [\n  'LangChain is a framework for LLM apps',\n  'RAG stands for Retrieval-Augmented Generation',\n  'Embeddings convert text to vectors'\n];\nconsole.log(searchDocuments(docs, 'What is RAG?'));",
        },
        points_reward: 10,
      },
    ],
  },
  {
    title: "AI Agents & Agentic AI",
    description:
      "Understand the difference between Generative AI, Agentic AI, and AI Agents. Build tools, give agents memory, and create autonomous workflows.",
    icon: "🤖",
    difficulty: "Intermediate",
    category: "AI",
    order_index: 12,
    chapters: [
      {
        title: "Generative AI vs Agentic AI vs AI Agents",
        content: {
          instructions:
            "These terms are often confused but describe different concepts:\n\n- **Generative AI**: Models that generate content (text, images, code)\n- **Agentic AI**: Systems that can take actions autonomously\n- **AI Agent**: A system that uses LLM + tools + memory to accomplish goals\n\n## Your Task\nCreate a simple AI Agent class that can process user requests and use basic tools.",
          initialCode:
            "class SimpleAgent {\n  constructor(tools) {\n    this.tools = tools;\n  }\n  \n  processRequest(request) {\n    // Your code here\n  }\n}\n\nconst tools = {\n  calculator: (expr) => eval(expr),\n  getTime: () => new Date().toLocaleTimeString()\n};\n\nconst agent = new SimpleAgent(tools);\nconsole.log(agent.processRequest('What time is it?'));",
          solution:
            "class SimpleAgent {\n  constructor(tools) {\n    this.tools = tools;\n  }\n  \n  processRequest(request) {\n    if (request.includes('time')) return this.tools.getTime();\n    if (request.includes('calculate')) {\n      const expr = request.match(/calculate (.+)/)[1];\n      return this.tools.calculator(expr);\n    }\n    return 'I cannot process this request';\n  }\n}\n\nconst tools = {\n  calculator: (expr) => eval(expr),\n  getTime: () => new Date().toLocaleTimeString()\n};\n\nconst agent = new SimpleAgent(tools);\nconsole.log(agent.processRequest('What time is it?'));",
        },
        points_reward: 15,
      },
    ],
  },
  {
    title: "Docker & DevOps Essentials",
    description:
      "Learn Docker, Docker Compose, containers, and how to deploy AI applications. Essential DevOps skills for every developer.",
    icon: "🐳",
    difficulty: "Beginner",
    category: "DevOps",
    order_index: 13,
    chapters: [
      {
        title: "Docker Compose Explained",
        content: {
          instructions:
            "Docker Compose lets you define and run multiple containers with a single command. Instead of running `docker run` for each service, you define everything in a `docker-compose.yml` file.\n\n## Key Benefits\n- Single command to start everything\n- Network configuration handled automatically\n- Environment variables managed centrally\n\n## Your Task\nWrite a docker-compose.yml equivalent as a JavaScript object that defines a web app with a database service.",
          initialCode:
            "function createDockerCompose(appName, dbPassword) {\n  // Return a config object with services for 'app' and 'db'\n}\n\nconsole.log(JSON.stringify(createDockerCompose('myapp', 'secret123'), null, 2));",
          solution:
            "function createDockerCompose(appName, dbPassword) {\n  return {\n    version: '3.8',\n    services: {\n      app: {\n        image: 'node:18',\n        ports: ['3000:3000'],\n        environment: { DB_URL: 'postgres://db:5432/mydb' }\n      },\n      db: {\n        image: 'postgres:15',\n        environment: { POSTGRES_PASSWORD: dbPassword },\n        volumes: ['pgdata:/var/lib/postgresql/data']\n      }\n    },\n    volumes: { pgdata: {} }\n  };\n}\n\nconsole.log(JSON.stringify(createDockerCompose('myapp', 'secret123'), null, 2));",
        },
        points_reward: 10,
      },
    ],
  },
];

export const coursesData = [...allCourses, ...aiCoursesData];
