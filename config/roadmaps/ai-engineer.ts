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
    resources: [
      {
        type: "article",
        title: "roadmap.sh: AI Engineer",
        url: "https://roadmap.sh/ai-engineer",
      },
      {
        type: "course",
        title: "Google: Machine Learning Crash Course",
        url: "https://developers.google.com/machine-learning/crash-course",
      },
      {
        type: "docs",
        title: "OpenAI: Prompt engineering",
        url: "https://platform.openai.com/docs/guides/prompt-engineering",
      },
    ],
    children: [
      {
        id: "ai-python",
        title: "Python",
        description: "The default language for AI/ML.",
        level: "beginner",
        resources: [
          {
            type: "docs",
            title: "Python Docs",
            url: "https://docs.python.org/3/",
          },
          {
            type: "docs",
            title: "Python: The Python Tutorial",
            url: "https://docs.python.org/3/tutorial/",
          },
          {
            type: "docs",
            title: "Python: Standard library",
            url: "https://docs.python.org/3/library/index.html",
          },
        ],
        children: [
          {
            id: "ai-python-basics",
            title: "Python Basics",
            description: "Types, functions, modules, venv.",
            level: "beginner",
            resources: [
              {
                type: "article",
                title: "Python tutorial",
                url: "https://docs.python.org/3/tutorial/",
              },
              {
                type: "article",
                title: "Python: Getting started",
                url: "https://www.python.org/about/gettingstarted/",
              },
              {
                type: "docs",
                title: "Python: Built-in types",
                url: "https://docs.python.org/3/library/stdtypes.html",
              },
            ],
          },
          {
            id: "ai-numpy",
            title: "NumPy & Pandas",
            description: "Arrays, dataframes, vectorization.",
            level: "intermediate",
            resources: [
              { type: "docs", title: "NumPy", url: "https://numpy.org/doc/" },
              {
                type: "docs",
                title: "NumPy: Absolute beginners guide",
                url: "https://numpy.org/doc/stable/user/absolute_beginners.html",
              },
              {
                type: "docs",
                title: "pandas: Getting started",
                url: "https://pandas.pydata.org/docs/getting_started/index.html",
              },
              {
                type: "practice",
                title: "Kaggle: Python course",
                url: "https://www.kaggle.com/learn/python",
              },
            ],
          },
        ],
      },
      {
        id: "ai-ml-basics",
        title: "ML Basics",
        description: "Core concepts: training, loss, gradients, evaluation.",
        level: "intermediate",
        resources: [
          { type: "article", title: "fast.ai", url: "https://www.fast.ai/" },
          {
            type: "course",
            title: "Google: Machine Learning Crash Course",
            url: "https://developers.google.com/machine-learning/crash-course",
          },
          {
            type: "docs",
            title: "scikit-learn: User guide",
            url: "https://scikit-learn.org/stable/user_guide.html",
          },
        ],
        children: [
          {
            id: "ai-supervised",
            title: "Supervised Learning",
            description: "Regression, classification, train/test split.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "scikit-learn",
                url: "https://scikit-learn.org/stable/",
              },
              {
                type: "docs",
                title: "scikit-learn: Supervised learning",
                url: "https://scikit-learn.org/stable/supervised_learning.html",
              },
              {
                type: "course",
                title: "Google: ML Crash Course",
                url: "https://developers.google.com/machine-learning/crash-course",
              },
              {
                type: "practice",
                title: "Kaggle: Intro to Machine Learning",
                url: "https://www.kaggle.com/learn/intro-to-machine-learning",
              },
            ],
          },
          {
            id: "ai-eval",
            title: "Evaluation & Metrics",
            description: "Accuracy, F1, ROC-AUC, cross-validation.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "Metrics",
                url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
              },
              {
                type: "article",
                title: "Google: Classification metrics",
                url: "https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall",
              },
              {
                type: "practice",
                title: "Kaggle: Intermediate ML",
                url: "https://www.kaggle.com/learn/intermediate-machine-learning",
              },
            ],
          },
        ],
      },
      {
        id: "ai-llms",
        title: "LLMs & Prompting",
        description: "How LLMs work and how to use them well.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "Anthropic: Prompt engineering",
            url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering",
          },
          {
            type: "docs",
            title: "OpenAI: Prompt engineering",
            url: "https://platform.openai.com/docs/guides/prompt-engineering",
          },
          {
            type: "docs",
            title: "Anthropic: Prompt engineering overview",
            url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
          },
          {
            type: "video",
            title:
              "Generative AI Explained for Developers: LLMs, LangChain & AI Apps (Bangla)",
            url: "https://www.youtube.com/watch?v=5yWYv2WjcDU",
          },
        ],
        children: [
          {
            id: "ai-prompting",
            title: "Prompt Engineering",
            description:
              "Zero/shot, few-shot, chain-of-thought, system prompts.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "OpenAI prompt guide",
                url: "https://platform.openai.com/docs/guides/prompt-engineering",
              },
              {
                type: "docs",
                title: "Anthropic: Prompt engineering overview",
                url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
              },
              {
                type: "course",
                title: "Anthropic: Prompt engineering tutorial",
                url: "https://github.com/anthropics/prompt-eng-interactive-tutorial",
              },
              {
                type: "docs",
                title: "Google: Prompting guide",
                url: "https://ai.google.dev/gemini-api/docs/prompting-strategies",
              },
              {
                type: "video",
                title:
                  "LangChain Prompt Templates & Structured Output Explained (Bangla)",
                url: "https://www.youtube.com/watch?v=S6F-jekTkO0",
              },
            ],
          },
          {
            id: "ai-tokens",
            title: "Tokens & Context Windows",
            description: "Tokenization, context limits, cost.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "Tokenizer",
                url: "https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken",
              },
              {
                type: "docs",
                title: "tiktoken (GitHub)",
                url: "https://github.com/openai/tiktoken",
              },
              {
                type: "docs",
                title: "Anthropic: Context windows",
                url: "https://docs.anthropic.com/en/docs/build-with-claude/context-windows",
              },
            ],
          },
          {
            id: "ai-structured",
            title: "Structured Output",
            description: "JSON mode, function calling, schemas.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "OpenAI functions",
                url: "https://platform.openai.com/docs/guides/function-calling",
              },
              {
                type: "docs",
                title: "OpenAI: Structured outputs",
                url: "https://platform.openai.com/docs/guides/structured-outputs",
              },
              {
                type: "docs",
                title: "JSON Schema: Specification",
                url: "https://json-schema.org/understanding-json-schema/",
              },
              {
                type: "docs",
                title: "Instructor: Documentation",
                url: "https://python.useinstructor.com/",
              },
              {
                type: "video",
                title:
                  "LangChain Prompt Templates & Structured Output Explained (Bangla)",
                url: "https://www.youtube.com/watch?v=S6F-jekTkO0",
              },
            ],
          },
        ],
      },
      {
        id: "ai-embeddings",
        title: "Embeddings & Vector DBs",
        description: "Semantic search foundations.",
        level: "intermediate",
        resources: [
          {
            type: "docs",
            title: "OpenAI: Embeddings guide",
            url: "https://platform.openai.com/docs/guides/embeddings",
          },
          {
            type: "docs",
            title: "Sentence Transformers: Documentation",
            url: "https://sbert.net/",
          },
        ],
        children: [
          {
            id: "ai-embeddings-concept",
            title: "Embeddings",
            description: "Vector representations of text.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "OpenAI embeddings",
                url: "https://platform.openai.com/docs/guides/embeddings",
              },
              {
                type: "docs",
                title: "Sentence Transformers",
                url: "https://sbert.net/",
              },
              {
                type: "docs",
                title: "MTEB: Embedding leaderboard",
                url: "https://huggingface.co/spaces/mteb/leaderboard",
              },
              {
                type: "video",
                title:
                  "What Are Embeddings? The Foundation of RAG & AI Search (Bangla)",
                url: "https://www.youtube.com/watch?v=N2BJwtSFP7s",
              },
            ],
          },
          {
            id: "ai-vectordb",
            title: "Vector Databases",
            description: "Pinecone, pgvector, Qdrant, Chroma.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "pgvector",
                url: "https://github.com/pgvector/pgvector",
              },
              {
                type: "docs",
                title: "Pinecone: Learning center",
                url: "https://www.pinecone.io/learn/",
              },
              {
                type: "docs",
                title: "Chroma: Documentation",
                url: "https://docs.trychroma.com/",
              },
              {
                type: "video",
                title:
                  "LangChain Vector Store Explained: Store & Search Embeddings for RAG (Bangla)",
                url: "https://www.youtube.com/watch?v=vMV85pHr464",
              },
            ],
          },
        ],
      },
      {
        id: "ai-rag",
        title: "RAG",
        description: "Retrieval-Augmented Generation end to end.",
        level: "advanced",
        resources: [
          {
            type: "article",
            title: "RAG overview",
            url: "https://www.pinecone.io/learn/retrieval-augmented-generation/",
          },
          {
            type: "docs",
            title: "LangChain: RAG tutorial",
            url: "https://python.langchain.com/docs/tutorials/rag/",
          },
          {
            type: "docs",
            title: "LlamaIndex: Documentation",
            url: "https://docs.llamaindex.ai/en/stable/",
          },
          {
            type: "video",
            title:
              "RAG Explained: How Retrieval-Augmented Generation Actually Works (Bangla)",
            url: "https://www.youtube.com/watch?v=8_cuad916us",
          },
          {
            type: "video",
            title:
              "Build a PDF RAG Chatbot with LangChain in Bangla (Complete Beginner Project)",
            url: "https://www.youtube.com/watch?v=4HFYZWXctak",
          },
        ],
        children: [
          {
            id: "ai-chunking",
            title: "Chunking & Indexing",
            description: "Split, embed, store.",
            level: "advanced",
            resources: [
              {
                type: "article",
                title: "Chunking strategies",
                url: "https://www.pinecone.io/learn/chunking-strategies/",
              },
              {
                type: "docs",
                title: "LangChain: Text splitters",
                url: "https://python.langchain.com/docs/concepts/text_splitters/",
              },
              {
                type: "article",
                title: "Anthropic: Contextual retrieval",
                url: "https://www.anthropic.com/news/contextual-retrieval",
              },
              {
                type: "video",
                title:
                  "LangChain Document Loaders Explained: Load PDFs, TXT & More for RAG (Bangla)",
                url: "https://www.youtube.com/watch?v=TY6wAx2L3jA",
              },
              {
                type: "video",
                title:
                  "LangChain Text Splitting Explained: Chunking for Better RAG (Bangla)",
                url: "https://www.youtube.com/watch?v=eZED4LOUvr8",
              },
            ],
          },
          {
            id: "ai-retrieval",
            title: "Retrieval & Reranking",
            description: "Top-k, MMR, rerankers.",
            level: "advanced",
            resources: [
              {
                type: "article",
                title: "Reranking",
                url: "https://www.pinecone.io/learn/series/rag/rerankers/",
              },
              {
                type: "docs",
                title: "Cohere: Rerank",
                url: "https://docs.cohere.com/docs/rerank-overview",
              },
              {
                type: "docs",
                title: "MTEB: Retrieval leaderboard",
                url: "https://huggingface.co/spaces/mteb/leaderboard",
              },
              {
                type: "video",
                title:
                  "LangChain Retrievers Explained: Similarity, MMR & MultiQuery Search (Bangla)",
                url: "https://www.youtube.com/watch?v=lgymF9qoVGE",
              },
            ],
          },
        ],
      },
      {
        id: "ai-agents",
        title: "Agents & Tool Use",
        description: "LLMs that act: tools, planning, memory.",
        level: "advanced",
        resources: [
          {
            type: "article",
            title: "Anthropic: Tool use",
            url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
          },
          {
            type: "docs",
            title: "Anthropic: Tool use",
            url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview",
          },
          {
            type: "docs",
            title: "OpenAI: Agents guide",
            url: "https://platform.openai.com/docs/guides/agents",
          },
          {
            type: "video",
            title: "Generative AI vs Agentic AI vs AI Agents Explained Simply",
            url: "https://www.youtube.com/watch?v=sCN-DIcZegE",
          },
          {
            type: "video",
            title:
              "How AI Agents Actually Work: Build One from Scratch with LangChain (Bangla)",
            url: "https://www.youtube.com/watch?v=8mpa-4iRrvc",
          },
          {
            type: "video",
            title:
              "My AI Agent Workflow: How I Manage Multiple AI Agents as a Developer (Bangla)",
            url: "https://www.youtube.com/watch?v=Go_76y1Q-HU",
          },
        ],
        children: [
          {
            id: "ai-tools",
            title: "Tool / Function Calling",
            description: "Let the model call your code.",
            level: "advanced",
            resources: [
              {
                type: "docs",
                title: "OpenAI tools",
                url: "https://platform.openai.com/docs/guides/function-calling",
              },
              {
                type: "docs",
                title: "Anthropic: Tool use",
                url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview",
              },
              {
                type: "docs",
                title: "Google: Function calling",
                url: "https://ai.google.dev/gemini-api/docs/function-calling",
              },
              {
                type: "video",
                title:
                  "LangChain Tools Explained: How LLMs Use APIs, Search & Functions (Bangla)",
                url: "https://www.youtube.com/watch?v=h4E2MsQCuu4",
              },
              {
                type: "video",
                title:
                  "MCP Server Explained: Build Your First Model Context Protocol Server (Bangla)",
                url: "https://www.youtube.com/watch?v=OhrNp2CsSBI",
              },
            ],
          },
          {
            id: "ai-agent-frameworks",
            title: "Agent Frameworks",
            description: "LangChain, LangGraph, CrewAI.",
            level: "advanced",
            optional: true,
            resources: [
              {
                type: "docs",
                title: "LangGraph",
                url: "https://langchain-ai.github.io/langgraph/",
              },
              {
                type: "docs",
                title: "OpenAI Agents SDK",
                url: "https://openai.github.io/openai-agents-python/",
              },
              {
                type: "docs",
                title: "Pydantic AI: Documentation",
                url: "https://ai.pydantic.dev/",
              },
              {
                type: "video",
                title:
                  "Build Your First AI Chatbot with LangChain in Python (Beginner Guide in Bangla)",
                url: "https://www.youtube.com/watch?v=QndKWRg0LhU",
              },
              {
                type: "video",
                title:
                  "OpenCode Tutorial: Build a Project with AI Agents (Complete Beginner Guide) in Bangla",
                url: "https://www.youtube.com/watch?v=4wVmDzdCH0M",
              },
              {
                type: "video",
                title:
                  "LangChain Runnables Explained: Build AI Pipelines the Easy Way (Bangla)",
                url: "https://www.youtube.com/watch?v=JGsTM8UerAM",
              },
            ],
          },
          {
            id: "ai-memory",
            title: "Memory & State",
            description: "Short/long-term memory, conversation state.",
            level: "advanced",
            optional: true,
            resources: [
              {
                type: "article",
                title: "Memory",
                url: "https://www.pinecone.io/learn/retrieval-augmented-generation/",
              },
              {
                type: "docs",
                title: "LangGraph: Memory concepts",
                url: "https://langchain-ai.github.io/langgraph/concepts/memory/",
              },
              {
                type: "docs",
                title: "Letta: Documentation",
                url: "https://docs.letta.com/",
              },
              {
                type: "docs",
                title: "mem0 (GitHub)",
                url: "https://github.com/mem0ai/mem0",
              },
            ],
          },
        ],
      },
      {
        id: "ai-finetuning",
        title: "Fine-tuning (optional)",
        description: "When prompting isn't enough.",
        level: "advanced",
        optional: true,
        resources: [
          {
            type: "docs",
            title: "OpenAI fine-tuning",
            url: "https://platform.openai.com/docs/guides/fine-tuning",
          },
          {
            type: "docs",
            title: "Hugging Face: PEFT",
            url: "https://huggingface.co/docs/peft/index",
          },
          {
            type: "article",
            title: "LoRA: Low-Rank Adaptation (arXiv)",
            url: "https://arxiv.org/abs/2106.09685",
          },
        ],
      },
      {
        id: "ai-eval-obs",
        title: "Evaluation & Observability",
        description: "Measure quality; trace in production.",
        level: "advanced",
        resources: [
          {
            type: "docs",
            title: "OpenAI: Evals guide",
            url: "https://platform.openai.com/docs/guides/evals",
          },
          {
            type: "docs",
            title: "LangSmith: Evaluation",
            url: "https://docs.langchain.com/langsmith/evaluate-llm-application",
          },
          {
            type: "docs",
            title: "promptfoo: Documentation",
            url: "https://www.promptfoo.dev/docs/intro/",
          },
        ],
        children: [
          {
            id: "ai-evals",
            title: "Evals",
            description: "Golden datasets, LLM-as-judge, regression.",
            level: "advanced",
            resources: [
              {
                type: "article",
                title: "Evals guide",
                url: "https://platform.openai.com/docs/guides/evals",
              },
              {
                type: "docs",
                title: "LangSmith: Evaluation",
                url: "https://docs.langchain.com/langsmith/evaluate-llm-application",
              },
              {
                type: "docs",
                title: "promptfoo: Documentation",
                url: "https://www.promptfoo.dev/docs/intro/",
              },
            ],
          },
          {
            id: "ai-tracing",
            title: "Tracing (LangSmith/Phoenix)",
            description: "Trace LLM calls end to end.",
            level: "advanced",
            resources: [
              {
                type: "docs",
                title: "LangSmith",
                url: "https://docs.smith.langchain.com/",
              },
              {
                type: "docs",
                title: "LangSmith: Documentation",
                url: "https://docs.langchain.com/langsmith/home",
              },
              {
                type: "docs",
                title: "Arize Phoenix: Documentation",
                url: "https://docs.arize.com/phoenix",
              },
              {
                type: "docs",
                title: "OpenTelemetry: GenAI semantic conventions",
                url: "https://opentelemetry.io/docs/specs/semconv/gen-ai/",
              },
            ],
          },
        ],
      },
      {
        id: "ai-deploy",
        title: "Deployment & Cost",
        description: "Ship AI features; control cost and latency.",
        level: "advanced",
        resources: [
          {
            type: "docs",
            title: "FastAPI: Documentation",
            url: "https://fastapi.tiangolo.com/",
          },
          {
            type: "docs",
            title: "OpenAI: Batch API",
            url: "https://platform.openai.com/docs/guides/batch",
          },
        ],
        children: [
          {
            id: "ai-api",
            title: "Serving (FastAPI / serverless)",
            description: "Expose models via HTTP.",
            level: "advanced",
            resources: [
              {
                type: "docs",
                title: "FastAPI",
                url: "https://fastapi.tiangolo.com/",
              },
              {
                type: "docs",
                title: "FastAPI: Tutorial",
                url: "https://fastapi.tiangolo.com/tutorial/",
              },
              {
                type: "docs",
                title: "vLLM: Documentation",
                url: "https://docs.vllm.ai/en/latest/",
              },
              {
                type: "docs",
                title: "OpenAI: Batch API",
                url: "https://platform.openai.com/docs/guides/batch",
              },
            ],
          },
          {
            id: "ai-caching",
            title: "Caching & Rate Limiting",
            description: "Cache responses, limit abuse.",
            level: "advanced",
            resources: [
              {
                type: "article",
                title: "Rate limiting",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429",
              },
              {
                type: "docs",
                title: "OpenAI: Prompt caching",
                url: "https://platform.openai.com/docs/guides/prompt-caching",
              },
              {
                type: "docs",
                title: "Anthropic: Prompt caching",
                url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
              },
              {
                type: "docs",
                title: "Redis: Client-side caching",
                url: "https://redis.io/docs/latest/develop/reference/client-side-caching/",
              },
            ],
          },
          {
            id: "ai-safety",
            title: "Safety & Guardrails",
            description: "PII, prompt injection, content filters.",
            level: "advanced",
            optional: true,
            resources: [
              {
                type: "article",
                title: "Prompting Guide: Adversarial prompting",
                url: "https://www.promptingguide.ai/risks/adversarial",
              },
              {
                type: "docs",
                title: "OWASP: Top 10 for LLM applications",
                url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
              },
              {
                type: "docs",
                title: "OpenAI: Safety best practices",
                url: "https://platform.openai.com/docs/guides/safety-best-practices",
              },
              {
                type: "docs",
                title: "NIST: AI Risk Management Framework",
                url: "https://www.nist.gov/itl/ai-risk-management-framework",
              },
              {
                type: "video",
                title:
                  "AI Agents Can Write Code, But Who Controls Them? Harness Engineering! (Bangla)",
                url: "https://www.youtube.com/watch?v=-1bbwRB0l4I",
              },
            ],
          },
        ],
      },
    ],
  },
};
