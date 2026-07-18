import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Loader2, Bot, User as UserIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CHAT_PAGE } from "@/constants/testIds";
import { toast } from "@/components/ui/sonner";

export default function ChatAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get("/chat/history").then(({ data }) => {
      if (data.length === 0) {
        setMessages([{ role: "assistant", content: `Hi ${user?.name?.split(" ")[0] || "there"}! I'm the QuickFix Assistant. Tell me what needs fixing and I'll help you find the right pro.` }]);
      } else {
        setMessages(data);
      }
    });
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });
      if (!response.ok || !response.body) throw new Error("Chat request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const payload = JSON.parse(part.slice(6));
          if (payload.delta) {
            setMessages((m) => {
              const next = [...m];
              next[next.length - 1] = { role: "assistant", content: next[next.length - 1].content + payload.delta };
              return next;
            });
          }
        }
      }
    } catch (e) {
      toast.error("The assistant is unavailable right now. Please try again.");
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-73px)] max-w-3xl flex-col px-4 py-6 md:px-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">QuickFix Assistant</h1>
          <p className="text-xs text-muted-foreground">Tell me what's going on and I'll point you to the right service.</p>
        </div>
      </div>

      <div ref={scrollRef} data-testid={CHAT_PAGE.messageList} className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
                <Bot className="h-3.5 w-3.5" />
              </span>
            )}
            <div
              data-testid={m.role === "user" ? CHAT_PAGE.userBubble(i) : CHAT_PAGE.assistantBubble(i)}
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-blue-500 text-white" : "bg-accent text-foreground"
              }`}
            >
              {m.content || (streaming && i === messages.length - 1 ? (
                <span data-testid={CHAT_PAGE.typingIndicator} className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.3s]" />
                </span>
              ) : null)}
            </div>
            {m.role === "user" && (
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
                <UserIcon className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-end gap-2 rounded-2xl border border-border bg-card p-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          data-testid={CHAT_PAGE.messageInput}
          placeholder="e.g. My kitchen sink is leaking..."
          className="min-h-[44px] resize-none border-none bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
        />
        <Button
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          data-testid={CHAT_PAGE.sendButton}
          className="h-11 w-11 shrink-0 rounded-xl bg-blue-500 p-0 text-white hover:bg-blue-400"
        >
          {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
