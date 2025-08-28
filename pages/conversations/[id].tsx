import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { ConversationDto } from "@/src/dto/conversation.dto";
import type { MessageDto } from "@/src/dto/message.dto";
import { getServerSession } from "next-auth/next";
import type { GetServerSideProps } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type ApiResponse<T> = {
  message: string;
  code: number;
  data?: T;
  error?: unknown;
};

export default function ConversationDetailPage() {
  const router = useRouter();
  const conversationId = useMemo(() => {
    const id = router.query.id;
    return typeof id === "string" ? id : undefined;
  }, [router.query.id]);

  const [conversation, setConversation] = useState<ConversationDto | null>(
    null
  );
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // pagination state for chunks (load latest first)
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [hasMore, setHasMore] = useState(false);

  // chat input and streaming state
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingUserText, setPendingUserText] = useState("");
  const [streamingAssistantText, setStreamingAssistantText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    void fetchConversation(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    void fetchMessages(conversationId, page, limit);
  }, [conversationId, page, limit]);

  async function fetchConversation(id: string) {
    setError(null);
    try {
      const url = new URL("/api/conversation/get", window.location.origin);
      url.searchParams.set("id", id);
      const res = await fetch(url.toString(), { method: "GET" });
      const json = (await res.json()) as ApiResponse<ConversationDto | null>;
      if (!res.ok || json.code !== 0) {
        throw new Error(json.message || "加载失败");
      }
      setConversation((json.data as ConversationDto) || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
  }

  async function fetchMessages(id: string, pageNum: number, pageSize: number) {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/message/chunk", window.location.origin);
      url.searchParams.set("conversation_id", id);
      url.searchParams.set("page", String(pageNum));
      url.searchParams.set("limit", String(pageSize));
      const res = await fetch(url.toString(), { method: "GET" });
      const json = (await res.json()) as ApiResponse<{
        messages: MessageDto[];
        pagination: { hasMore: boolean };
      }>;
      if (!res.ok || json.code !== 0 || !json.data) {
        throw new Error(json.message || "加载失败");
      }
      setMessages(json.data.messages);
      setHasMore(Boolean(json.data.pagination?.hasMore));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  function scrollToBottom() {
    // delay to ensure DOM updated
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingUserText, streamingAssistantText]);

  async function sendMessage() {
    if (!conversationId || !input.trim() || sending) return;
    setError(null);
    setSending(true);
    setPendingUserText(input);
    setStreamingAssistantText("");

    try {
      const res = await fetch("/api/message/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: { text: input.trim() },
        }),
      });

      setInput("");

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "发送失败");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      // track stream completion via server 'done' event if needed

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value, { stream: true });
        buffer += chunkText;

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const eventBlock = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          // parse SSE block
          const lines = eventBlock.split("\n");
          let dataLine = "";
          for (const line of lines) {
            if (line.startsWith(":")) {
              // comment / heartbeat
              continue;
            }
            if (line.startsWith("data:")) {
              dataLine += line.slice(5).trim();
            }
          }

          if (dataLine) {
            try {
              const payload = JSON.parse(dataLine);
              if (typeof payload.chunk === "string") {
                setStreamingAssistantText((prev) => prev + payload.chunk);
              }
            } catch {
              // ignore parse errors
            }
          }

          boundary = buffer.indexOf("\n\n");
        }
      }

      // if done or stream ended, refresh messages
      await fetchMessages(conversationId, 1, limit);
      setPage(1);
      setPendingUserText("");
      setStreamingAssistantText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "发送失败");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Conversation</h1>
        <div className="flex items-center gap-4">
          <Link className="text-sm underline" href="/conversations">
            返回列表
          </Link>
          <Link className="text-sm underline" href="/">
            返回首页
          </Link>
        </div>
      </div>

      {error ? <div className="text-red-600 text-sm">{error}</div> : null}

      <section className="border rounded-md p-4 space-y-2">
        <div className="text-sm text-gray-600">ID: {conversationId}</div>
        {conversation ? (
          <div className="space-y-1">
            <div className="text-lg font-medium">
              {conversation.title || "(未命名)"}
            </div>
            <div className="text-sm text-gray-600">
              Agent: {conversation.agentId}
            </div>
            <div className="text-sm text-gray-600">
              最后消息时间:{" "}
              {new Date(conversation.lastMessageAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">未找到会话信息</div>
        )}
      </section>

      <section className="border rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">消息</h2>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded"
              onClick={() =>
                void fetchMessages(conversationId as string, page, limit)
              }
              disabled={loading || !conversationId}
            >
              刷新
            </button>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading || !hasMore}
            >
              加载更早
            </button>
          </div>
        </div>

        <div className="space-y-3 h-[60vh] overflow-y-auto border rounded p-3">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-500">
              {loading ? "加载中..." : "暂无消息"}
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="border rounded p-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>角色: {m.role}</span>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <div className="whitespace-pre-wrap text-sm">
                  {m.content || ""}
                </div>
              </div>
            ))
          )}

          {/* pending user and streaming assistant bubbles */}
          {pendingUserText ? (
            <div className="border rounded p-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>角色: user</span>
                <span>现在</span>
              </div>
              <div className="whitespace-pre-wrap text-sm">
                {pendingUserText}
              </div>
            </div>
          ) : null}
          {sending || streamingAssistantText ? (
            <div className="border rounded p-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>角色: assistant</span>
                <span>生成中...</span>
              </div>
              <div className="whitespace-pre-wrap text-sm">
                {streamingAssistantText}
              </div>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="flex items-start gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage();
          }}
        >
          <textarea
            className="border rounded px-3 py-2 w-full min-h-20"
            placeholder="输入消息，按 Enter 发送（Shift+Enter 换行）"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            disabled={sending}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            disabled={sending || !input.trim() || !conversationId}
          >
            {sending ? "发送中..." : "发送"}
          </button>
        </form>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session?.user?.id) {
    return {
      redirect: {
        destination:
          "/api/auth/signin/google?callbackUrl=" +
          encodeURIComponent(`/conversations/${ctx.params?.id}`),
        permanent: false,
      },
    };
  }
  return { props: {} };
};
