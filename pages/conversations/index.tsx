import Link from "next/link";
import { useEffect, useState } from "react";
import type { ConversationDto } from "@/src/dto/conversation.dto";
import { getServerSession } from "next-auth/next";
import type { GetServerSideProps } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type ApiResponse<T> = {
  message: string;
  code: number;
  data?: T;
  error?: unknown;
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchConversations();
  }, []);

  async function fetchConversations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/conversation/list", { method: "GET" });
      const json = (await res.json()) as ApiResponse<ConversationDto[]>;
      if (!res.ok || json.code !== 0 || !json.data) {
        throw new Error(json.message || "加载失败");
      }
      setConversations(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Conversations</h1>
        <div className="flex items-center gap-4">
          <Link className="text-sm underline" href="/agents">
            Agents
          </Link>
          <Link className="text-sm underline" href="/">
            返回首页
          </Link>
        </div>
      </div>

      {error ? <div className="text-red-600 text-sm">{error}</div> : null}

      <section className="border rounded-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">会话列表</h2>
          <button
            className="text-sm underline"
            onClick={() => void fetchConversations()}
            disabled={loading}
          >
            {loading ? "刷新中..." : "刷新"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">标题</th>
                <th className="p-2">Agent ID</th>
                <th className="p-2">最后消息时间</th>
                <th className="p-2">创建时间</th>
                <th className="p-2 w-[140px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {conversations.length === 0 ? (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={5}>
                    {loading ? "加载中..." : "暂无数据"}
                  </td>
                </tr>
              ) : (
                conversations.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-2 whitespace-pre-wrap">
                      {c.title || "(未命名)"}
                    </td>
                    <td className="p-2 whitespace-pre-wrap">{c.agent_id}</td>
                    <td className="p-2 whitespace-pre-wrap">
                      {new Date(c.last_message_at).toLocaleString()}
                    </td>
                    <td className="p-2 whitespace-pre-wrap">
                      {new Date(c.created_at).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <Link
                        className="px-3 py-1 border rounded inline-block"
                        href={`/conversations/${c.id}`}
                      >
                        查看
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/api/auth/signin/google?callbackUrl=/conversations",
        permanent: false,
      },
    };
  }
  return { props: {} };
};
