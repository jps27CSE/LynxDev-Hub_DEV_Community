import type { Roadmap } from "./types";

export const aiEngineerRoadmap: Roadmap = {
  slug: "ai-engineer",
  title: "AI Engineer",
  description:
    "Step-by-step guide to becoming an AI engineer in 2026 — from Python and ML basics to LLM apps, RAG, agents, and production deployment.",
  category: "ai",
  level: "intermediate",
  updatedAt: "2026-10-20",
  estimatedHours: 180,
  tags: ["python", "ml", "llm", "rag", "agents", "mlops"],
  root: {
    id: "ai-root",
    title: "AI Engineering Foundations",
    description: "The skills to build and ship AI-powered products.",
    level: "intermediate",
    resources: [{ type: "article", title: "roadmap.sh: AI Engineer", url: "https://roadmap.sh/ai-engineer" }],
    children: [
      {
        id: "ai-python",
        title: "Python",
        description: "The default language for AI/ML.",
        level: "beginner",
        resources: [{ type: "docs", title: "Python Docs", url: "https://docs.python.org/3/" }],
        children: [
          { id: "ai-python-basics", title: "Python Basics", description: "Types, functions, modules, venv.", level: "beginner", resources: [{ type: "article", title: "Python tutorial", url: "https://docs.python.org/3/tutorial/" }] },
          { id: "ai-numpy", title: "NumPy & Pandas", description: "Arrays, dataframes, vectorization.", level: "intermediate", resources: [{ type: "docs", title: "NumPy", url: "https://numpy.org/doc/" }] },
        ],
      },
      {
        id: "ai-ml-basics",
        title: "ML Basics",
        description: "Core concepts: training, loss, gradients, evaluation.",
        level: "intermediate",
        resources: [{ type: "article", title: "fast.ai", url: "https://www.fast.ai/" }],
        children: [
          { id: "ai-supervised", title: "Supervised Learning", description: "Regression, classification, train/test split.", level: "intermediate", resources: [{ type: "article", title: "scikit-learn", url: "https://scikit-learn.org/stable/" }] },
          { id: "ai-eval", title: "Evaluation & Metrics", description: "Accuracy, F1, ROC-AUC, cross-validation.", level: "intermediate", resources: [{ type: "article", title: "Metrics", url: "https://scikit-learn.org/stable/modules/model_evaluation.html" }] },
        ],
      },
      {
        id: "ai-llms",
        title: "LLMs & Prompting",
        description: "How LLMs work and how to use them well.",
        level: "intermediate",
        resources: [{ type: "article", title: "Anthropic: Prompt engineering", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering" }],
        children: [
          { id: "ai-prompting", title: "Prompt Engineering", description: "Zero/shot, few-shot, chain-of-thought, system prompts.", level: "intermediate", resources: [{ type: "article", title: "OpenAI prompt guide", url: "https://platform.openai.com/docs/guides/prompt-engineering" }] },
          { id: "ai-tokens", title: "Tokens & Context Windows", description: "Tokenization, context limits, cost.", level: "intermediate", resources: [{ type: "article", title: "Tokenizer", url: "https://platform.openai.com/tokenizer" }] },
          { id: "ai-structured", title: "Structured Output", description: "JSON mode, function calling, schemas.", level: "intermediate", resources: [{ type: "docs", title: "OpenAI functions", url: "https://platform.openai.com/docs/guides/function-calling" }] },
        ],
      },
      {
        id: "ai-embeddings",
        title: "Embeddings & Vector DBs",
        description: "Semantic search foundations.",
        level: "intermediate",
        resources: [],
        children: [
          { id: "ai-embeddings-concept", title: "Embeddings", description: "Vector representations of text.", level: "intermediate", resources: [{ type: "article", title: "OpenAI embeddings", url: "https://platform.openai.com/docs/guides/embeddings" }] },
          { id: "ai-vectordb", title: "Vector Databases", description: "Pinecone, pgvector, Qdrant, Chroma.", level: "intermediate", resources: [{ type: "docs", title: "pgvector", url: "https://github.com/pgvector/pgvector" }] },
        ],
      },
      {
        id: "ai-rag",
        title: "RAG",
        description: "Retrieval-Augmented Generation end to end.",
        level: "advanced",
        resources: [{ type: "article", title: "RAG overview", url: "https://www.pinecone.io/learn/retrieval-augmented-generation/" }],
        children: [
          { id: "ai-chunking", title: "Chunking & Indexing", description: "Split, embed, store.", level: "advanced", resources: [{ type: "article", title: "Chunking strategies", url: "https://www.pinecone.io/learn/chunking-strategies/" }] },
          { id: "ai-retrieval", title: "Retrieval & Reranking", description: "Top-k, MMR, rerankers.", level: "advanced", resources: [{ type: "article", title: "Reranking", url: "https://www.pinecone.io/learn/series/rag/rerankers/" }] },
        ],
      },
      {
        id: "ai-agents",
        title: "Agents & Tool Use",
        description: "LLMs that act: tools, planning, memory.",
        level: "advanced",
        resources: [{ type: "article", title: "Anthropic: Tool use", url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use" }],
        children: [
          { id: "ai-tools", title: "Tool / Function Calling", description: "Let the model call your code.", level: "advanced", resources: [{ type: "docs", title: "OpenAI tools", url: "https://platform.openai.com/docs/guides/function-calling" }] },
          { id: "ai-agent-frameworks", title: "Agent Frameworks", description: "LangChain, LangGraph, CrewAI.", level: "advanced", optional: true, resources: [{ type: "docs", title: "LangGraph", url: "https://langchain-ai.github.io/langgraph/" }] },
          { id: "ai-memory", title: "Memory & State", description: "Short/long-term memory, conversation state.", level: "advanced", optional: true, resources: [{ type: "article", title: "Memory", url: "https://www.pinecone.io/learn/series/rag/rag-chatbot/" }] },
        ],
      },
      {
        id: "ai-finetuning",
        title: "Fine-tuning (optional)",
        description: "When prompting isn't enough.",
        level: "advanced",
        optional: true,
        resources: [{ type: "docs", title: "OpenAI fine-tuning", url: "https://platform.openai.com/docs/guides/fine-tuning" }],
      },
      {
        id: "ai-eval-obs",
        title: "Evaluation & Observability",
        description: "Measure quality; trace in production.",
        level: "advanced",
        resources: [],
        children: [
          { id: "ai-evals", title: "Evals", description: "Golden datasets, LLM-as-judge, regression.", level: "advanced", resources: [{ type: "article", title: "Evals guide", url: "https://platform.openai.com/docs/guides/evals" }] },
          { id: "ai-tracing", title: "Tracing (LangSmith/Phoenix)", description: "Trace LLM calls end to end.", level: "advanced", resources: [{ type: "docs", title: "LangSmith", url: "https://docs.smith.langchain.com/" }] },
        ],
      },
      {
        id: "ai-deploy",
        title: "Deployment & Cost",
        description: "Ship AI features; control cost and latency.",
        level: "advanced",
        resources: [],
        children: [
          { id: "ai-api", title: "Serving (FastAPI / serverless)", description: "Expose models via HTTP.", level: "advanced", resources: [{ type: "docs", title: "FastAPI", url: "https://fastapi.tiangolo.com/" }] },
          { id: "ai-caching", title: "Caching & Rate Limiting", description: "Cache responses, limit abuse.", level: "advanced", resources: [{ type: "article", title: "Rate limiting", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429" }] },
          { id: "ai-safety", title: "Safety & Guardrails", description: "PII, prompt injection, content filters.", level: "advanced", optional: true, resources: [{ type: "article", title: "Prompt injection", url: "https://owasp.org/www-community/attacks/Prompt_Injection" }] },
        ],
      },
    ],
  },
};