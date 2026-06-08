import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center px-6 max-w-lg">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">&#x2728;</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">网站重新定义中</h1>
        <p className="text-slate-400 text-lg mb-8">
          当前正在重构产品方向，核心功能即将上线。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account" className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors text-center">
            进入会员中心
          </Link>
          <Link href="/pricing" className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors text-center">
            查看价格方案
          </Link>
        </div>
      </div>
    </main>
  );
}
