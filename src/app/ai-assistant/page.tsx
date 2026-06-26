"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Sparkles, Search, ShoppingBag, Target, Filter, Download,
  FolderOpen, ClipboardList, ChevronRight,
} from "lucide-react";

/* ===== MOCK DATA ===== */
const MOCK_RESULTS = [
  { id: 1, name: "夏季冰丝防晒衣UPF50+", platform: "1688", category: "服饰内衣", price: "¥39.9", sales: "12.8万", profit: "¥16.5", profitRate: "41%", heat: 98, competition: "中", aiScore: 96, aiSuggestion: "季节需求强，价格带稳定，适合短视频带货测试。" },
  { id: 2, name: "厨房沥水置物架双层", platform: "1688", category: "家居日用", price: "¥49.9", sales: "5.1万", profit: "¥18.6", profitRate: "37%", heat: 89, competition: "低", aiScore: 88, aiSuggestion: "痛点明显，前后对比内容效果好。" },
  { id: 3, name: "儿童防晒帽UPF50+", platform: "淘宝", category: "母婴用品", price: "¥29.9", sales: "6.5万", profit: "¥12.8", profitRate: "42%", heat: 91, competition: "中", aiScore: 89, aiSuggestion: "人群明确，适合宝妈内容场景。" },
  { id: 4, name: "大容量运动水壶2L", platform: "1688", category: "运动户外", price: "¥49", sales: "4.8万", profit: "¥18.6", profitRate: "38%", heat: 88, competition: "低", aiScore: 85, aiSuggestion: "实用性强，适合直播带货场景。" },
  { id: 5, name: "磁吸充电宝10000mAh", platform: "京东", category: "3C数码", price: "¥79", sales: "2.8万", profit: "¥28.4", profitRate: "36%", heat: 78, competition: "高", aiScore: 72, aiSuggestion: "竞争激烈，需差异化卖点。" },
];

const AI_ANALYSIS_DEFAULT = { score: 96, profitLevel: "优秀", heatLevel: "高", riskLevel: "中", channels: "短视频带货 / 直播间转化", testBudget: "¥300 - ¥800", conclusion: "该商品具备季节需求强、价格带稳定、内容展示效果好三个优势，建议先制作3条不同卖点短视频进行测试。" };

function getCompetitionBadge(level: string) { if (level === "低") return "bg-emerald-50 text-emerald-600 border-emerald-200"; if (level === "中") return "bg-amber-50 text-amber-600 border-amber-200"; return "bg-red-50 text-red-600 border-red-200"; }
function getHeatColor(heat: number) { if (heat >= 90) return "bg-gradient-to-r from-orange-500 to-red-500"; if (heat >= 80) return "bg-gradient-to-r from-amber-400 to-orange-500"; return "bg-gradient-to-r from-gray-400 to-gray-500"; }
function AIAssistantPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [, setUser] = useState<{ email?: string } | null>(null);
  const [, setAuthLoading] = useState(true);
  const [platform, setPlatform] = useState("1688");
  const [method, setMethod] = useState("keyword");
  const [keyword, setKeyword] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [results, setResults] = useState<typeof MOCK_RESULTS>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email });
      setAuthLoading(false);
    });
  }, []);

  const handleSearch = (kw?: string) => {
    const q = kw || keyword;
    if (!q.trim()) return;
    setSearching(true);
    setTimeout(() => { setResults(MOCK_RESULTS); setHasSearched(true); setSelectedId(null); setSearching(false); }, 600);
  };

  useEffect(() => { if (initialQuery) handleSearch(initialQuery); /* eslint-disable-line */ }, []);

  const selectedProduct = selectedId ? results.find((r) => r.id === selectedId) : null;
  const analysisData = selectedProduct ? {
    score: selectedProduct.aiScore,
    profitLevel: parseInt(selectedProduct.profitRate) >= 40 ? "优秀" : "良好",
    heatLevel: selectedProduct.heat >= 90 ? "高" : selectedProduct.heat >= 80 ? "中" : "低",
    riskLevel: selectedProduct.competition,
    channels: selectedProduct.category === "母婴用品" ? "宝妈短视频 / 亲子直播" : "短视频带货 / 直播间转化",
    testBudget: selectedProduct.competition === "高" ? "¥500 - ¥1500" : "¥300 - ¥800",
    conclusion: selectedProduct.aiSuggestion,
  } : AI_ANALYSIS_DEFAULT;


  const platforms = [
    { key: "taobao", label: "淘宝" }, { key: "1688", label: "1688" },
    { key: "jd", label: "京东" }, { key: "tmall", label: "天猫" },
  ];
  const methods = [
    { key: "keyword", label: "关键词选品" }, { key: "nlp", label: "自然语言" },
    { key: "market", label: "市场分析" }, { key: "category", label: "类目选品" },
  ];

  return (
    <WorkspaceLayout>
      <div className="space-y-5">
        {/* Header Card */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-orange-50" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-sm shadow-blue-200">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-[#1a1a2e]">智能选品中心</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200">选品雷达</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">AI智能选品</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/ai-assistant?tab=plan"><button className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-all flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> 选品计划</button></Link>
              <Link href="/ai-assistant?tab=library"><button className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-all flex items-center gap-1.5"><FolderOpen className="h-3.5 w-3.5" /> 选品库</button></Link>
              <Link href="/product-radar"><button className="px-3.5 py-2 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 transition-all flex items-center gap-1.5">全部商品 <ChevronRight className="h-3.5 w-3.5" /></button></Link>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Filter Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <div><h3 className="text-sm font-bold text-[#1a1a2e]">智能筛选作业台</h3>
                  <p className="text-xs text-gray-400 mt-0.5">当前：{platforms.find(p => p.key === platform)?.label} · {methods.find(m => m.key === method)?.label}</p></div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>候选：<strong className="text-[#1a1a2e]">{results.length}</strong></span>
                  <span>S/A：<strong className="text-[#1a1a2e]">{results.filter(r => r.aiScore >= 85).length}</strong></span>
                </div>
              </div>
              <div className="mb-4"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">电商平台</p>
                <div className="flex flex-wrap gap-2">{platforms.map((p) => (
                  <button key={p.key} onClick={() => setPlatform(p.key)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${platform === p.key ? "bg-gradient-to-r from-blue-500 to-sky-400 text-white shadow-sm shadow-blue-200" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>{p.label}</button>
                ))}</div>
              </div>
              <div className="mb-4"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">选品方式</p>
                <div className="flex flex-wrap gap-2">{methods.map((m) => (
                  <button key={m.key} onClick={() => setMethod(m.key)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${method === m.key ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"}`}>{m.label}</button>
                ))}</div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
                <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                    placeholder={"输入商品关键词，如 夏季连衣裙、防晒衣、厨房置物架"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 focus:bg-white transition-all" /></div>
                <button type="submit" disabled={searching || !keyword.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 text-white text-sm font-medium hover:from-blue-600 hover:to-sky-500 transition-all shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0">
                  {searching ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> 搜索中...</> : <><Search className="h-4 w-4" /> 开始搜索</>}
                </button>
              </form>
            </motion.div>

            {/* Results or Empty */}
            <AnimatePresence mode="wait">
              {!hasSearched ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 md:p-14 text-center">
                  <div className="inline-flex h-16 w-16 rounded-2xl bg-blue-50 items-center justify-center mb-5"><Search className="h-7 w-7 text-blue-400" /></div>
                  <h3 className="text-base font-bold text-[#1a1a2e] mb-2">输入关键词，开始发现高潜力商品</h3>
                  <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto leading-relaxed">系统将根据价格、销量、利润、热度和竞争度，生成 AI 选品建议。</p>
                  <button onClick={() => { setKeyword("夏季防晒衣"); handleSearch("夏季防晒衣"); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200">
                    <Sparkles className="h-4 w-4" /> 试试：夏季防晒衣</button>
                </motion.div>
              ) : (
                <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-md bg-blue-50 flex items-center justify-center"><Sparkles className="h-3 w-3 text-blue-500" /></div><h3 className="text-sm font-bold text-[#1a1a2e]">AI推荐商品</h3><span className="text-xs text-gray-400">({results.length} 个结果)</span></div>
                    <div className="flex items-center gap-1.5"><button className="px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-1"><Filter className="h-3 w-3" /> 筛选</button><button className="px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-1"><Download className="h-3 w-3" /> 导出</button></div>
                  </div>
                  <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto"><table className="w-full">
                      <thead><tr className="bg-gray-50/50 border-b border-gray-100">{["商品名称","平台","类目","售价","近7日销量","预估利润","利润率","热度","竞争","AI评分","AI建议"].map((h)=>(<th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>))}</tr></thead>
                      <tbody>{results.map((item)=>(
                        <tr key={item.id} onClick={() => setSelectedId(selectedId === item.id ? null : item.id)} className={`border-b border-gray-50 cursor-pointer transition-colors ${selectedId === item.id ? "bg-blue-50/50" : "hover:bg-gray-50/50"}`}>
                          <td className="px-4 py-3.5"><div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><ShoppingBag className="h-3.5 w-3.5 text-gray-400" /></div><span className="text-sm font-medium text-[#1a1a2e]">{item.name}</span></div></td>
                          <td className="px-4 py-3.5"><span className={`text-xs px-2 py-1 rounded-md font-medium ${item.platform==="1688"?"bg-orange-50 text-orange-600 border border-orange-200":item.platform==="淘宝"?"bg-blue-50 text-blue-600 border border-blue-200":"bg-gray-50 text-gray-600 border border-gray-200"}`}>{item.platform}</span></td>
                          <td className="px-4 py-3.5"><span className="text-xs text-gray-500">{item.category}</span></td>
                          <td className="px-4 py-3.5"><span className="text-sm font-bold text-orange-500">{item.price}</span></td>
                          <td className="px-4 py-3.5"><span className="text-sm font-medium text-[#1a1a2e]">{item.sales}</span></td>
                          <td className="px-4 py-3.5"><span className="text-sm font-bold text-emerald-600">{item.profit}</span></td>
                          <td className="px-4 py-3.5"><span className="text-sm font-medium text-emerald-600">{item.profitRate}</span></td>
                          <td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="flex-1 max-w-[60px] h-1.5 rounded-full bg-gray-100"><div className={`h-1.5 rounded-full ${getHeatColor(item.heat)}`} style={{width:`${item.heat}%`}}/></div><span className={`text-xs font-bold ${item.heat>=90?"text-orange-500":item.heat>=80?"text-amber-500":"text-gray-500"}`}>{item.heat}</span></div></td>
                          <td className="px-4 py-3.5"><span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getCompetitionBadge(item.competition)}`}>{item.competition}</span></td>
                          <td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="flex-1 max-w-[50px] h-1.5 rounded-full bg-gray-100"><div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-400" style={{width:`${item.aiScore}%`}}/></div><span className="text-xs font-bold text-blue-600">{item.aiScore}</span></div></td>
                          <td className="px-4 py-3.5"><span className="text-[11px] text-gray-500 line-clamp-2 max-w-[160px]">{item.aiSuggestion}</span></td>
                        </tr>
                      ))}</tbody></table></div></div>
                  <div className="md:hidden space-y-3">{results.map((item)=>(
                    <div key={item.id} onClick={() => setSelectedId(selectedId === item.id ? null : item.id)} className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-colors ${selectedId === item.id?"border-blue-300 bg-blue-50/30":"border-gray-100"}`}>
                      <div className="flex items-start justify-between mb-2"><div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center"><ShoppingBag className="h-3.5 w-3.5 text-gray-400"/></div><div><p className="text-sm font-medium text-[#1a1a2e]">{item.name}</p><div className="flex items-center gap-1.5 mt-0.5"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${item.platform==="1688"?"bg-orange-50 text-orange-600":"bg-blue-50 text-blue-600"}`}>{item.platform}</span><span className="text-[10px] text-gray-400">{item.category}</span></div></div></div><span className="text-sm font-bold text-orange-500">{item.price}</span></div>
                      <div className="grid grid-cols-3 gap-2 text-xs"><div><span className="text-gray-400">销量</span><p className="font-medium text-[#1a1a2e]">{item.sales}</p></div><div><span className="text-gray-400">利润</span><p className="font-bold text-emerald-600">{item.profit}</p></div><div><span className="text-gray-400">AI评分</span><p className="font-bold text-blue-600">{item.aiScore}</p></div></div>
                      <p className="text-[11px] text-gray-500 mt-2 line-clamp-2">{item.aiSuggestion}</p>
                    </div>
                  ))}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: AI Analysis */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <div className="flex items-center gap-2.5 mb-5"><div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center"><Sparkles className="h-4 w-4 text-blue-500"/></div><h3 className="text-sm font-bold text-[#1a1a2e]">AI选品分析</h3></div>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100"><p className="text-[11px] text-gray-400 mb-1">综合推荐评分</p><p className="text-3xl font-bold text-blue-600">{analysisData.score}</p><div className="mt-2 h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-sky-400" style={{width:`${analysisData.score}%`}}/></div></div>
                {[
                  {label:"利润空间",value:analysisData.profitLevel,color:"text-emerald-600 bg-emerald-50"},
                  {label:"市场热度",value:analysisData.heatLevel,color:"text-orange-600 bg-orange-50"},
                  {label:"竞争风险",value:analysisData.riskLevel,color:analysisData.riskLevel==="低"?"text-emerald-600 bg-emerald-50":analysisData.riskLevel==="中"?"text-amber-600 bg-amber-50":"text-red-600 bg-red-50"},
                  {label:"测试预算",value:analysisData.testBudget,color:"text-gray-700 bg-gray-50"}
                ].map((d)=>(<div key={d.label} className="text-center p-3 rounded-xl border border-gray-100"><p className="text-[11px] text-gray-400 mb-1">{d.label}</p><p className={`text-xs font-bold rounded-full px-2 py-0.5 inline-block ${d.color}`}>{d.value}</p></div>))}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100"><p className="text-[11px] text-gray-400 mb-1">适合渠道</p><p className="text-xs font-medium text-[#1a1a2e]">{analysisData.channels}</p></div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100"><p className="text-[11px] font-semibold text-blue-600 mb-2">分析结论</p><p className="text-xs text-gray-600 leading-relaxed">{analysisData.conclusion}</p></div>
              </div>
            </motion.div>
            <div className="space-y-3">
              {[{icon:ClipboardList,title:"选品计划",desc:"保存高潜力商品，形成选品任务列表。",href:"/ai-assistant?tab=plan"},{icon:FolderOpen,title:"选品库",desc:"沉淀已筛选商品，方便后续对比和复盘。",href:"/ai-assistant?tab=library"},{icon:Search,title:"AI找货源",desc:"根据商品关键词寻找可供货平台和价格区间。",href:"/ai-assistant?tab=source"}].map((card)=>(
                <Link key={card.title} href={card.href} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors"><card.icon className="h-4.5 w-4.5 text-blue-500"/></div>
                  <div><h4 className="text-sm font-bold text-[#1a1a2e] mb-0.5">{card.title}</h4><p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p></div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 shrink-0 mt-2 transition-colors"/>
                </Link>
              ))}</div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#f5f8fb]"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"/></div>}>
      <AIAssistantPageContent />
    </Suspense>
  );
}
