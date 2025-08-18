import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">ChattyKitty</h1>
          <p className="text-sm text-gray-600 mt-1">选择模块开始使用</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/conversations"
            className="group block rounded-xl border border-black/[.08] dark:border-white/[.15] p-6 hover:border-transparent hover:bg-[#f8f8f8] dark:hover:bg-[#141414] transition-colors"
          >
            <div className="text-xl font-medium">Conversations</div>
            <p className="text-sm text-gray-600 mt-1">查看与继续最近的会话</p>
            <div className="mt-4 text-sm opacity-70 group-hover:opacity-100">
              前往 →
            </div>
          </Link>

          <Link
            href="/agents"
            className="group block rounded-xl border border-black/[.08] dark:border-white/[.15] p-6 hover:border-transparent hover:bg-[#f8f8f8] dark:hover:bg-[#141414] transition-colors"
          >
            <div className="text-xl font-medium">Manage Agents</div>
            <p className="text-sm text-gray-600 mt-1">
              管理 Agent（新增、删除、修改 System Prompt）
            </p>
            <div className="mt-4 text-sm opacity-70 group-hover:opacity-100">
              前往 →
            </div>
          </Link>

          <Link
            href="/api/auth/signin/google"
            className="group block rounded-xl border border-black/[.08] dark:border-white/[.15] p-6 hover:border-transparent hover:bg-[#f8f8f8] dark:hover:bg-[#141414] transition-colors"
            prefetch={false}
          >
            <div className="text-xl font-medium">Sign in with Google</div>
            <p className="text-sm text-gray-600 mt-1">
              使用 Google 账号登录（NextAuth）
            </p>
            <div className="mt-4 text-sm opacity-70 group-hover:opacity-100">
              立即登录 →
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
