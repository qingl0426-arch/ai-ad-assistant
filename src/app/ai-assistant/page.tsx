"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Sparkles, Search, ShoppingBag, Target, Filter, Download,
  FolderOpen, ClipboardList, ChevronRight, TrendingUp,
} from "lucide-react";

/* ===== MOCK DATA ===== */
const MOCK_RESULTS = [
  { id: 1, name: "夏季冰丝防晒衣UPF50+", platform: "1688", cat: "服饰内衣", price: "¥39.9", sales: "12.8万", profit: "¥16.5", profitRate: "41%", heat: 98, comp: "中", score: 96, suggestion: "季节需求强，价格带稳定，适合短视频带货测试。" },
  { id: 2, name: "厨房沥水置物架双层", platform: "1688", cat: "家居日用", price: "¥49.9", sales: "5.1万", profit: "¥18.6", profitRate: "37%", heat: 89, comp: "低", score: 88, suggestion: "痛点明显，前后对比内容效果好，加购率预期较高。" },
  { id: 3, name: "儿童防晒帽UPF50+", platform: "淘宝", cat: "母婴用品", price: "¥29.9", sales: "6.5万", profit: "¥12.8", profitRate: "42%", heat: 91, comp: "中", score: 89, suggestion: "人群明确，适合宝妈内容场景，转化率稳定。" },
  { id: 4, name: "大容量运动水壶2L", platform: "1688", cat: "运动户外", price: "¥49", sales: "4.8万", profit: "¥18.6", profitRate: "38%", heat: 88, comp: "低", score: 85, suggestion: "实用性强，适合直播带货，演示容量对比效果好。" },
  { id: 5, name: "磁吸充电宝10000mAh", platform: "京东", cat: "3C数码", price: "¥79", sales: "2.8万", profit: "¥28.4", profitRate: "36%", heat: 78, comp: "高", score: 72, suggestion: "竞争激烈，需差异化卖点，投流测试成本较高。" },
];

const HOT_DIRECTIONS = [
  { tag: "夏季防晒", growth: "+32%", fit: "服饰 / 户外", icon: ShoppingBag, color: "bg-orange-50 text-orange-600" },
  { tag: "厨房收纳", growth: "+18%", fit: "家居 / 百货", icon: FolderOpen, color: "bg-blue-50 text-blue-600" },
  { tag: "儿童出行", growth: "+26%", fit: "母婴", icon: Target, color: "bg-pink-50 text-pink-600" },
  { tag: "低脂零食", growth: "+21%", fit: "食品", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
];

const QUICK_KEYWORDS = ["夏季防晒衣", "厨房置物架", "儿童水杯", "蓝牙耳机"];

const AI_ANALYSIS_DEFAULT = { score: 96, profitLevel: "优秀", heatLevel: "高", riskLevel: "中", channels: "短视频带货 / 直播间转化", testBudget: "¥300 - ¥800", conclusion: "该商品具备季节需求强、价格带稳定、内容展示效果好三个优势，建议先制作3条不同卖点短视频进行测试，观察点击率、加购率和转化率。" };

function compBadge(l: string) { return l === "低" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : l === "中" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-red-50 text-red-600 border-red-200"; }
function heatBar(h: number) { return h >= 90 ? "from-orange-500 to-red-500" : h >= 80 ? "from-amber-400 to-orange-500" : "from-gray-400 to-gray-500"; }
function heatTxt(h: number) { return h >= 90 ? "text-orange-500" : h >= 80 ? "text-amber-500" : "text-gray-500"; }


function ResultCard({ item, selected, onClick }: { item: typeof MOCK_RESULTS[0]; selected: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className={`bg-white rounded-[14px] border p-4 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 ${selected ? "border-[#1688ff] shadow-[0_4px_16px_rgba(22,136,255,0.12)]" : "border-[#e5eaf0] shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:border-[#cbd5e1] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)]"}`}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#f8fafc] to-[#e5eaf0] flex items-center justify-center shrink-0"><ShoppingBag className="h-5 w-5 text-[#94a3b8]"/></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="text-sm font-bold text-[#0f172a] mb-1">{item.name}</h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${item.platform === "1688" ? "bg-orange-50 text-orange-600" : item.platform === "淘宝" ? "bg-[#eaf4ff] text-[#1688ff]" : "bg-[#f8fafc] text-[#475569]"}`}>{item.platform}</span>
                <span className="text-[11px] text-[#94a3b8]">{item.cat}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right"><p className="text-[10px] text-[#94a3b8]">售价</p><p className="text-sm font-bold text-[#ff7a00]">{item.price}</p></div>
              <div className="text-right"><p className="text-[10px] text-[#94a3b8]">销量</p><p className="text-sm font-medium text-[#0f172a]">{item.sales}</p></div>
              <div className="text-right"><p className="text-[10px] text-[#94a3b8]">利润</p><p className="text-sm font-bold text-[#16a34a]">{item.profit}<span className="text-[11px] ml-0.5 text-[#16a34a]">{item.profitRate}</span></p></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-[#f1f5f9]">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#94a3b8]">热度</span>
          <div className="w-[60px] h-[6px] rounded-full bg-[#f1f5f9]"><div className={`h-[6px] rounded-full bg-gradient-to-r ${heatBar(item.heat)}`} style={{ width: `${item.heat}%` }} /></div>
          <span className={`text-[11px] font-bold ${heatTxt(item.heat)}`}>{item.heat}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${compBadge(item.comp)}`}>{item.comp}竞争</span>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-[50px] h-[6px] rounded-full bg-[#f1f5f9]"><div className="h-[6px] rounded-full bg-gradient-to-r from-[#1688ff] to-[#1d9bf0]" style={{ width: `${item.score}%` }} /></div>
          <span className="text-[11px] font-bold text-[#1688ff]">{item.score}</span>
        </div>
        <div className="flex-1 ml-3 px-3 py-1.5 rounded-lg bg-[#eaf4ff] text-[11px] text-[#0f172a] leading-relaxed">{item.suggestion}</div>
      </div>
    </div>
  );
}

function AIAssistantPageContent() {
  const sp = useSearchParams();
  const initQ = sp.get("q") || "";
  const [, setUser] = useState<{ email?: string } | null>(null);
  const [, setAL] = useState(true);
  const [platform, setPlatform] = useState("1688");
  const [method, setMethod] = useState("keyword");
  const [kw, setKw] = useState(initQ);
  const [searched, setSearched] = useState(!!initQ);
  const [results, setResults] = useState<typeof MOCK_RESULTS>([]);
  const [selId, setSelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => { if (data.user) setUser({ email: data.user.email }); setAL(false); });
  }, []);

  const doSearch = (q?: string) => {
    const term = q || kw;
    if (!term.trim()) return;
    setLoading(true);
    setTimeout(() => { setResults(MOCK_RESULTS); setSearched(true); setSelId(null); setLoading(false); }, 500);
  };

  useEffect(() => { if (initQ) doSearch(initQ); }, []); // eslint-disable-line

  const sel = selId ? results.find(r => r.id === selId) : null;

  const ad = sel ? { score: sel.score, profitLevel: parseInt(sel.profitRate) >= 40 ? "优秀" : "良好", heatLevel: sel.heat >= 90 ? "高" : sel.heat >= 80 ? "中" : "低", riskLevel: sel.comp, channels: sel.cat === "母婴用品" ? "宝妈短视频 / 亲子直播" : "短视频带货 / 直播间转化", testBudget: sel.comp === "高" ? "¥500 - ¥1500" : "¥300 - ¥800", conclusion: sel.suggestion } : AI_ANALYSIS_DEFAULT;

  const platforms = [{ k:"taobao",l:"淘宝" },{ k:"1688",l:"1688" },{ k:"jd",l:"京东" },{ k:"tmall",l:"天猫" }];
  const methods = [{ k:"keyword",l:"关键词选品" },{ k:"nlp",l:"自然语言" },{ k:"market",l:"市场分析" },{ k:"cat",l:"类目选品" }];

  return (
    <WorkspaceLayout>
      <div className="space-y-4">
        {/* Header Card */}
        <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
          className="relative overflow-hidden bg-white rounded-[18px] border border-[#e5eef7] shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#eef7ff] via-white to-[#fff8ee]" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1688ff] to-[#1d9bf0] flex items-center justify-center shadow-sm shadow-blue-200">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-[#94a3b8] font-medium">智能选品中心</p>
                <div className="flex items-center gap-2">
                  <h1 className="text-[18px] font-bold text-[#0f172a]">AI智能选品</h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#eaf4ff] text-[#1688ff] border border-[#bdd9ff]">选品雷达</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[{l:"选品计划",h:"/ai-assistant?tab=plan",i:Target},{l:"选品库",h:"/ai-assistant?tab=library",i:FolderOpen}].map(b=>(
                <Link key={b.l} href={b.h}><button className="px-3.5 py-2 rounded-[10px] text-xs font-medium text-[#475569] bg-white border border-[#e5eaf0] hover:border-[#1688ff] hover:text-[#1688ff] transition-all flex items-center gap-1.5"><b.i className="h-3.5 w-3.5" />{b.l}</button></Link>
              ))}
              <Link href="/product-radar"><button className="px-3.5 py-2 rounded-[10px] text-xs font-medium text-[#1688ff] bg-[#eaf4ff] border border-[#bdd9ff] hover:bg-[#d6eaff] transition-all flex items-center gap-1.5">全部<ChevronRight className="h-3.5 w-3.5" /></button></Link>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-4">
          <div className="space-y-4">
            {/* Filter Card */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.04 }}
              className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#0f172a]">智能筛选作业台</h3>
                {searched && (<div className="flex items-center gap-2 text-[11px]"><span className="px-2.5 py-1 rounded-full bg-[#f8fafc] border border-[#e5eaf0] text-[#475569]">候选 <strong className="text-[#0f172a]">{results.length}</strong></span><span className="px-2.5 py-1 rounded-full bg-[#eaf4ff] border border-[#bdd9ff] text-[#1688ff]">S/A <strong>{results.filter(r=>r.score>=85).length}</strong></span></div>)}
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[11px] font-semibold text-[#94a3b8] mr-1">平台</span>
                {platforms.map(p=>(<button key={p.k} onClick={()=>setPlatform(p.k)} className={`px-3.5 py-[7px] rounded-[10px] text-xs font-medium transition-all ${platform===p.k?"bg-gradient-to-r from-[#1688ff] to-[#1d9bf0] text-white shadow-sm":"bg-white text-[#475569] border border-[#e5eaf0] hover:border-[#cbd5e1]"}`}>{p.l}</button>))}
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[11px] font-semibold text-[#94a3b8] mr-1">方式</span>
                {methods.map(m=>(<button key={m.k} onClick={()=>setMethod(m.k)} className={`px-3.5 py-[7px] rounded-[10px] text-xs font-medium transition-all ${method===m.k?"bg-[#eaf4ff] text-[#1688ff] border border-[#bdd9ff]":"bg-white text-[#475569] border border-[#e5eaf0] hover:border-[#cbd5e1]"}`}>{m.l}</button>))}
              </div>
              <form onSubmit={e=>{e.preventDefault();doSearch();}} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#94a3b8]" />
                  <input type="text" value={kw} onChange={e=>setKw(e.target.value)} placeholder="输入商品、类目、场景词，如 防晒衣、厨房收纳..." className="w-full h-[44px] pl-10 pr-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] text-[13px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#1688ff] focus:ring-2 focus:ring-[#eaf4ff] focus:bg-white transition-all" />
                </div>
                <button type="submit" disabled={loading||!kw.trim()} className="px-5 h-[44px] rounded-[14px] bg-gradient-to-r from-[#1688ff] to-[#1d9bf0] text-white text-sm font-semibold hover:from-[#1670d9] hover:to-[#1980dd] transition-all shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0">
                  {loading?<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> 搜索中</>:<><Search className="h-4 w-4"/> 开始搜索</>}
                </button>
              </form>
              <p className="text-[11px] text-[#94a3b8] mt-2.5">支持输入商品词、类目词、场景词，例如：防晒衣、厨房收纳、儿童水杯</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {!searched ? (
                <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                  {/* Empty */}
                  <div className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-8 text-center">
                    <div className="inline-flex h-12 w-12 rounded-xl bg-[#eaf4ff] items-center justify-center mb-4"><Search className="h-5 w-5 text-[#1688ff]" /></div>
                    <h3 className="text-[15px] font-bold text-[#0f172a] mb-1.5">输入关键词，开始发现高潜力商品</h3>
                    <p className="text-[13px] text-[#94a3b8] mb-4">系统将结合价格、销量、利润、热度和竞争度，生成 AI 选品建议。</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {QUICK_KEYWORDS.map(kk=>(<button key={kk} onClick={()=>{setKw(kk);doSearch(kk);}} className="px-3.5 py-2 rounded-[10px] bg-[#f8fafc] border border-[#e5eaf0] text-[13px] text-[#475569] hover:border-[#1688ff] hover:text-[#1688ff] hover:bg-[#eaf4ff] transition-all">{kk}</button>))}
                    </div>
                  </div>
                  {/* Hot Directions */}
                  <div>
                    <h3 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#ff7a00]" />热门选品方向</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {HOT_DIRECTIONS.map(d=>(<button key={d.tag} onClick={()=>{setKw(d.tag);doSearch(d.tag);}} className="bg-white rounded-[14px] border border-[#e5eaf0] p-4 text-left hover:border-[#1688ff] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-200">
                        <div className={`inline-flex h-8 w-8 rounded-lg ${d.color} items-center justify-center mb-2.5`}><d.icon className="h-4 w-4" /></div>
                        <p className="text-sm font-bold text-[#0f172a] mb-1">{d.tag}</p>
                        <div className="flex items-center gap-2 text-[11px]"><span className="text-emerald-600 font-semibold">{d.growth}</span><span className="text-[#94a3b8]">{d.fit}</span></div>
                      </button>))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="results" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-[#eaf4ff] flex items-center justify-center"><Sparkles className="h-3 w-3 text-[#1688ff]"/></div>
                      <h3 className="text-sm font-bold text-[#0f172a]">AI推荐商品</h3>
                      <span className="text-xs text-[#94a3b8]">({results.length})</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="px-2.5 py-1.5 rounded-[10px] text-[11px] text-[#94a3b8] hover:text-[#475569] hover:bg-[#f8fafc] transition-all flex items-center gap-1"><Filter className="h-3 w-3"/>筛选</button>
                      <button className="px-2.5 py-1.5 rounded-[10px] text-[11px] text-[#94a3b8] hover:text-[#475569] hover:bg-[#f8fafc] transition-all flex items-center gap-1"><Download className="h-3 w-3"/>导出</button>
                    </div>
                  </div>
                  {results.map(item => (
                    <ResultCard key={item.id} item={item} selected={selId === item.id} onClick={() => setSelId(selId === item.id ? null : item.id)} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.08}}
              className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
              <div className="flex items-center gap-2.5 mb-4"><div className="h-8 w-8 rounded-lg bg-[#eaf4ff] flex items-center justify-center"><Sparkles className="h-4 w-4 text-[#1688ff]"/></div><div><h3 className="text-sm font-bold text-[#0f172a]">AI选品分析</h3>{sel && <p className="text-[10px] text-[#94a3b8]">{sel.name}</p>}</div></div>
              <div className="bg-gradient-to-br from-[#eaf4ff] to-white rounded-xl p-4 border border-[#bdd9ff] mb-4"><p className="text-[11px] text-[#94a3b8] mb-1">综合推荐评分</p><p className="text-[32px] font-bold text-[#1688ff] leading-none">{ad.score}</p><div className="mt-2 h-[6px] rounded-full bg-[#e5eaf0]"><div className="h-[6px] rounded-full bg-gradient-to-r from-[#1688ff] to-[#1d9bf0]" style={{width:`${ad.score}%`}}/></div></div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[{l:"利润空间",v:ad.profitLevel,c:"text-[#16a34a] bg-[#f0fdf4]"},{l:"市场热度",v:ad.heatLevel,c:"text-[#ff7a00] bg-[#fff7ed]"},{l:"竞争风险",v:ad.riskLevel,c:ad.riskLevel==="低"?"text-[#16a34a] bg-[#f0fdf4]":ad.riskLevel==="中"?"text-[#f59e0b] bg-[#fffbeb]":"text-[#ef4444] bg-[#fef2f2]"},{l:"测试预算",v:ad.testBudget,c:"text-[#475569] bg-[#f8fafc]"}].map(d=>(<div key={d.l} className="rounded-xl border border-[#e5eaf0] p-2.5 text-center"><p className="text-[10px] text-[#94a3b8] mb-1">{d.l}</p><p className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block ${d.c}`}>{d.v}</p></div>))}
              </div>
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e5eaf0] mb-3"><p className="text-[10px] text-[#94a3b8] mb-1">适合渠道</p><p className="text-xs font-medium text-[#0f172a]">{ad.channels}</p></div>
              <div className="p-3.5 rounded-xl bg-[#eff6ff] border border-[#bfdbfe]"><p className="text-[10px] font-semibold text-[#1688ff] mb-1.5">分析结论</p><p className="text-[11px] text-[#475569] leading-relaxed">{ad.conclusion}</p></div>
            </motion.div>
            <div className="space-y-2.5">
              {[{i:ClipboardList,t:"选品计划",d:"保存高潜力商品，形成选品任务列表"},{i:FolderOpen,t:"选品库",d:"沉淀已筛选商品，方便后续对比复盘"},{i:Search,t:"AI找货源",d:"根据关键词寻找供货平台和价格区间"}].map(c=>(<Link key={c.t} href="/ai-assistant" className="flex items-center gap-3 p-3.5 bg-white rounded-[14px] border border-[#e5eaf0] shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:border-[#1688ff] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-all duration-200 group"><div className="h-9 w-9 rounded-lg bg-[#eaf4ff] flex items-center justify-center shrink-0"><c.i className="h-4.5 w-4.5 text-[#1688ff]"/></div><div className="min-w-0"><h4 className="text-[13px] font-bold text-[#0f172a] mb-0.5">{c.t}</h4><p className="text-[11px] text-[#94a3b8] leading-relaxed">{c.d}</p></div><ChevronRight className="h-4 w-4 text-[#cbd5e1] shrink-0"/></Link>))}
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

export default function AIAssistantPage() {
  return (<Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#f3f7fb]"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1688ff] border-t-transparent"/></div>}><AIAssistantPageContent/></Suspense>);
}
