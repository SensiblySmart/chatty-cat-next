import { useEffect, useMemo, useState } from "react";
import type { AgentDto } from "@/src/dto/agent.dto";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import type { GetServerSideProps } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type ApiResponse<T> = {
  message: string;
  code: number;
  data?: T;
  error?: unknown;
};

type CreateAgentInput = {
  display_name: string;
  description: string;
  avatar_url: string;
  model_id: string;
  system_prompt: string;
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAgentInput>({
    display_name: "",
    description: "",
    avatar_url: "",
    model_id: "",
    system_prompt: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState("");
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  useEffect(() => {
    void fetchAgents();
  }, []);

  async function fetchAgents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/list", { method: "GET" });
      const json = (await res.json()) as ApiResponse<AgentDto[]>;
      if (!res.ok || json.code !== 0 || !json.data) {
        throw new Error(json.message || "加载失败");
      }
      setAgents(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const json = (await res.json()) as ApiResponse<AgentDto>;
      if (!res.ok || json.code !== 0 || !json.data) {
        throw new Error(json.message || "创建失败");
      }
      setAgents((prev) => [json.data as AgentDto, ...prev]);
      setCreateForm({
        display_name: "",
        description: "",
        avatar_url: "",
        model_id: "",
        system_prompt: "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  function startEditSystemPrompt(agent: AgentDto) {
    setEditingId(agent.id);
    setEditingPrompt(agent.system_prompt);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingPrompt("");
  }

  async function saveEdit() {
    if (!editingId) return;
    setError(null);
    try {
      const res = await fetch("/api/agent/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, system_prompt: editingPrompt }),
      });
      const json = (await res.json()) as ApiResponse<AgentDto>;
      if (!res.ok || json.code !== 0 || !json.data) {
        throw new Error(json.message || "保存失败");
      }
      const updated = json.data;
      setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  }

  async function deleteAgent(id: string) {
    if (!confirm("确认删除该 Agent 吗？")) return;
    setError(null);
    try {
      const res = await fetch("/api/agent/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = (await res.json()) as ApiResponse<unknown>;
      if (!res.ok || json.code !== 0) {
        throw new Error(json.message || "删除失败");
      }
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agents 管理</h1>
        <Link className="text-sm underline" href="/">
          返回首页
        </Link>
      </div>

      {error ? <div className="text-red-600 text-sm">{error}</div> : null}

      <section className="border rounded-md p-4 space-y-4">
        <h2 className="text-lg font-medium">新建 Agent</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleCreate}
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">显示名</span>
            <input
              className="border rounded px-3 py-2"
              value={createForm.display_name}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, display_name: e.target.value }))
              }
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">模型 ID</span>
            <input
              className="border rounded px-3 py-2"
              value={createForm.model_id}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, model_id: e.target.value }))
              }
              required
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm text-gray-600">描述</span>
            <input
              className="border rounded px-3 py-2"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, description: e.target.value }))
              }
              required
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm text-gray-600">头像 URL</span>
            <input
              className="border rounded px-3 py-2"
              value={createForm.avatar_url}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, avatar_url: e.target.value }))
              }
              required
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm text-gray-600">System Prompt</span>
            <textarea
              className="border rounded px-3 py-2 min-h-24"
              value={createForm.system_prompt}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, system_prompt: e.target.value }))
              }
              required
            />
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
              disabled={creating}
            >
              {creating ? "创建中..." : "创建"}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() =>
                setCreateForm({
                  display_name: "",
                  description: "",
                  avatar_url: "",
                  model_id: "",
                  system_prompt: "",
                })
              }
            >
              重置
            </button>
          </div>
        </form>
      </section>

      <section className="border rounded-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Agent 列表</h2>
          <button
            className="text-sm underline"
            onClick={() => void fetchAgents()}
            disabled={loading}
          >
            {loading ? "刷新中..." : "刷新"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">显示名</th>
                <th className="p-2">模型</th>
                <th className="p-2">描述</th>
                <th className="p-2">System Prompt</th>
                <th className="p-2 w-[180px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={5}>
                    {loading ? "加载中..." : "暂无数据"}
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="border-b align-top">
                    <td className="p-2 whitespace-pre-wrap">
                      {agent.display_name}
                    </td>
                    <td className="p-2 whitespace-pre-wrap">
                      {agent.model_id}
                    </td>
                    <td className="p-2 whitespace-pre-wrap">
                      {agent.description}
                    </td>
                    <td className="p-2 whitespace-pre-wrap">
                      {isEditing && editingId === agent.id ? (
                        <textarea
                          className="border rounded px-3 py-2 w-full min-h-24"
                          value={editingPrompt}
                          onChange={(e) => setEditingPrompt(e.target.value)}
                        />
                      ) : (
                        <pre className="text-xs whitespace-pre-wrap">
                          {agent.system_prompt}
                        </pre>
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing && editingId === agent.id ? (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-black text-white rounded"
                            onClick={() => void saveEdit()}
                          >
                            保存
                          </button>
                          <button
                            className="px-3 py-1 border rounded"
                            onClick={cancelEdit}
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 border rounded"
                            onClick={() => startEditSystemPrompt(agent)}
                          >
                            编辑 Prompt
                          </button>
                          <button
                            className="px-3 py-1 border rounded text-red-600"
                            onClick={() => void deleteAgent(agent.id)}
                          >
                            删除
                          </button>
                        </div>
                      )}
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
        destination: "/api/auth/signin/google?callbackUrl=/agents",
        permanent: false,
      },
    };
  }
  return { props: {} };
};
