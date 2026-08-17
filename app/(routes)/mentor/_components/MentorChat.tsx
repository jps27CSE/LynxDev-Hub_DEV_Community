"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  Loader2,
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  Code,
  TrendingUp,
  Lightbulb,
  Trash2,
  Copy,
  Check,
  Clock,
  ExternalLink,
} from "lucide-react";

const quickActions = [
  {
    label: "What should I learn next?",
    icon: TrendingUp,
    desc: "Personalized roadmap",
  },
  {
    label: "Help me practice coding",
    icon: Code,
    desc: "Exercises & challenges",
  },
  { label: "Explain a concept", icon: Lightbulb, desc: "Simplify any topic" },
];

const followUps = [
  "Can you give me an example?",
  "Tell me more about this",
  "What should I practice?",
];

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MentorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<{
    name: string;
    bio: string | null;
    skills: string[];
    points: number;
    courses: { title: string; progress: number; total: number }[];
  } | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/mentor/chat")
      .then((r) => r.json())
      .then((data) => {
        if (data.context) setContext(data.context);
        if (data.history) {
          setMessages(
            (
              data.history as { role: "user" | "assistant"; content: string }[]
            ).map((m) => ({
              ...m,
              timestamp: Date.now(),
            })),
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const pres = container.querySelectorAll<HTMLPreElement>("pre");
    pres.forEach((pre) => {
      if (pre.querySelector(".copy-pre-btn")) return;
      const btn = document.createElement("button");
      btn.className =
        "copy-pre-btn absolute top-3 right-3 w-7 h-7 rounded-lg bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-background/90";
      const code = pre.querySelector("code")?.textContent || "";
      const icon = document.createElement("span");
      icon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
      btn.appendChild(icon);
      btn.onclick = async () => {
        await navigator.clipboard.writeText(code);
        icon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check" style="color: #22c55e;"><path d="M20 6 9 17l-5-5"/></svg>';
        setTimeout(() => {
          icon.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
        }, 1500);
      };
      pre.classList.add("group");
      pre.style.position = "relative";
      pre.appendChild(btn);
    });
  }, [messages]);

  const sendMessage = useCallback(
    async (msg: string) => {
      if (!msg.trim() || streaming) return;
      setError("");
      setStreaming(true);
      const userMessage: Message = {
        role: "user",
        content: msg.trim(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/mentor/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg.trim() }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.text();
          setError(`Failed: ${err}`);
          setStreaming(false);
          return;
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "", timestamp: Date.now() },
        ]);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let full = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(Boolean);
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.token) {
                  full += parsed.token;
                  setMessages((prev) => {
                    const copy = [...prev];
                    copy[copy.length - 1] = {
                      role: "assistant",
                      content: full,
                      timestamp: copy[copy.length - 1].timestamp,
                    };
                    return copy;
                  });
                } else if (parsed.error) {
                  setError(parsed.error);
                }
              } catch {
                // skip
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [streaming],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const newChat = () => {
    setMessages([]);
    setError("");
    inputRef.current?.focus();
  };

  const level = !context
    ? ""
    : context.skills.length <= 2 && context.courses.every((c) => c.progress < 3)
      ? "Beginner"
      : context.skills.length <= 5
        ? "Intermediate"
        : "Advanced";

  const levelColor =
    level === "Beginner"
      ? "text-green-500 bg-green-500/10"
      : level === "Intermediate"
        ? "text-yellow-500 bg-yellow-500/10"
        : level === "Advanced"
          ? "text-red-500 bg-red-500/10"
          : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-background">
      {/* In-page top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Chat with Lynx</h2>
            <p className="text-[11px] text-muted-foreground">
              Powered by Mistral Large
            </p>
          </div>
        </div>
        <button
          onClick={newChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex gap-6 px-4 sm:px-6 lg:px-8 py-4 min-h-0 overflow-hidden">
        {/* Context sidebar */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 gap-4 self-start max-h-full overflow-y-auto">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {context?.name || "User"}
                </p>
                {level && (
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium ${levelColor}`}
                  >
                    {level}
                  </span>
                )}
              </div>
            </div>

            {context?.bio && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {context.bio}
              </p>
            )}

            {context && context.skills.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {context.skills.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(`Tell me about ${s}`)}
                      className="px-2 py-0.5 rounded-md bg-primary/5 text-xs font-medium text-primary/80 hover:bg-primary/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {context && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{context.points} pts</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>{context.courses.length} courses</span>
                </div>
              </div>
            )}
          </div>

          {context && context.courses.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Course Progress
              </p>
              <div className="space-y-2.5">
                {context.courses.map((c) => (
                  <div key={c.title} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="truncate">{c.title}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">
                        {c.progress}/{c.total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{
                          width: `${c.total > 0 ? Math.round((c.progress / c.total) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto space-y-4 scroll-smooth"
          >
            {messages.length === 0 && !streaming && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <h2 className="text-xl font-bold mb-1">
                  Hey {context?.name?.split(" ")[0] || "there"}!
                </h2>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  I&apos;m Lynx, your personal coding mentor. I know your skills
                  and progress — ask me anything about learning, career advice,
                  or what to study next.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 w-full max-w-lg">
                  {quickActions.map((a) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.label}
                        onClick={() => sendMessage(a.label)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all text-center"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
                          <Icon className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <span className="text-xs font-medium leading-snug">
                          {a.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {a.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border/50 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="markdown-content text-sm leading-relaxed [&_pre]:relative [&_pre]:rounded-xl [&_pre]:bg-[#1e1e1e] [&_pre]:p-4 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_code]:text-xs [&_code]:font-mono [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code::before]:content-none [&_pre_code::after]:content-none [&_h1]:text-base [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-1 [&_p]:my-2 [&_p:first-child]:mt-0 [&_a]:text-primary [&_a]:underline [&_a:hover]:opacity-80 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3 [&_strong]:font-semibold [&_hr]:my-4 [&_hr]:border-border/50 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_td]:border [&_td]:border-border/50 [&_td]:px-3 [&_td]:py-2 [&_td]:text-xs [&_img]:rounded-xl [&_img]:my-3 [&_img]:max-w-full">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                        >
                          {msg.content ||
                            (streaming && i === messages.length - 1 ? "▊" : "")}
                        </ReactMarkdown>
                        {streaming &&
                          i === messages.length - 1 &&
                          msg.content && (
                            <span className="inline-block w-2 h-4 bg-primary/60 rounded-sm animate-pulse ml-0.5" />
                          )}
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
                {msg.timestamp && (
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      msg.role === "user" ? "justify-end mr-11" : "ml-11"
                    }`}
                  >
                    <Clock className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground/50">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                )}
                {msg.role === "assistant" &&
                  !streaming &&
                  msg.content &&
                  i === messages.length - 1 && (
                    <div className="flex gap-2 mt-3 ml-11">
                      {followUps.map((f) => (
                        <button
                          key={f}
                          onClick={() => sendMessage(f)}
                          className="px-3 py-1.5 rounded-lg border border-border/50 bg-card text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
            {error && (
              <div className="text-sm text-red-500 bg-red-500/5 rounded-xl px-4 py-3 border border-red-500/20">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 mt-4 flex items-end gap-2 border border-border/50 rounded-2xl bg-card p-2 focus-within:border-primary/40 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Lynx anything..."
              disabled={streaming}
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {streaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
