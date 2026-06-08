/**
 * AI 选品分析器
 *
 * 调用 OpenAI 分析商品趋势数据，输出选品建议。
 * 只输出中文，不含 Markdown / JSON / 英文。
 */

import type { ProductTrendRow } from "@/types/database";

/* ================================================================
   类型
   ================================================================ */

export type SuggestionAction = "立即跟进" | "小批量测试" | "暂时观察" | "不建议跟品";

export interface AIProductSuggestion {
  product_name: string;
  hot_score: number;
  sales_growth: number;
  price: number;
  category: string;
  competition: string;
  action: SuggestionAction;
  reason: string;
  burst_probability: number;  // 爆款概率 0-100
  estimated_profit_rate: number; // 预计利润率 %
  risk_level: "低" | "中" | "高";
  risk_detail: string;
}

export interface AIProductAnalysisResult {
  summary: string;
  suggestions: AIProductSuggestion[];
  topPick?: AIProductSuggestion;
  generatedAt: string;
}

/* ================================================================
   System Prompt
   ================================================================ */

const SYSTEM_PROMPT = `你是电商选品顾问，不是普通数据分析师。

你的任务是根据商品趋势数据判断：
- 哪个商品值得跟
- 哪个商品风险高
- 哪个商品未来7天有爆发机会

你必须为每个商品输出：
- 推荐理由
- 爆款概率（0-100）
- 预计利润率
- 竞争风险
- 建议动作

建议动作只能是以下之一：
立即跟进、小批量测试、暂时观察、不建议跟品

规则：
1. 销量增长 > 200% 且竞争低 → 立即跟进
2. 销量增长 > 100% 且竞争中等 → 小批量测试
3. 利润率高但竞争高 → 暂时观察
4. 销量下降或竞争极高 → 不建议跟品
5. 低竞争 + 高增长 + 高利润率 → 最高优先级

你必须严格输出纯 JSON 格式，不能包含 Markdown、代码块标记、英文说明或其他文字。
输出格式：
{"summary":"一句话总结","suggestions":[{"product_name":"商品名","action":"小批量测试","reason":"推荐理由","burst_probability":85,"estimated_profit_rate":40,"risk_level":"低","risk_detail":"风险说明"}]}

所有字段必须用中文填写，数字字段用数字不要用字符串。`;

/* ================================================================
   OpenAI 调用
   ================================================================ */

function buildUserPrompt(products: ProductTrendRow[]): string {
  const productLines = products.slice(0, 20).map((p, i) => {
    return `${i + 1}. ${p.product_name} | 类目:${p.category || "未知"} | 价格:¥${p.price} | 近7天销量:${p.sales_7d} | 近7天GMV:¥${p.gmv_7d} | 销量增长:${p.sales_growth_rate}% | GMV增长:${p.gmv_growth_rate}% | 利润率估算:${Math.round((p.profit_margin_estimate || 0) * 100)}% | 竞争度:${p.competition_level} | 爆款指数:${p.hot_score} | 趋势:${p.trend_status}`;
  }).join("\n");

  return `请分析以下商品趋势数据，判断哪些商品值得跟品：

${productLines}

请输出 JSON 格式的选品建议。`;
}

/**
 * 调用 OpenAI 分析商品
 */
export async function analyzeProductsWithAI(
  products: ProductTrendRow[],
  apiKey: string
): Promise<AIProductAnalysisResult> {
  if (!products || products.length === 0) {
    return {
      summary: "暂无商品数据，请先上传商品趋势数据",
      suggestions: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(products) },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API 调用失败: ${response.status} ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // 清理可能的 Markdown 代码块
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  let parsed: AIProductAnalysisResult;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // 解析失败时使用兜底
    return buildFallbackResult(products);
  }

  // 确保字段完整
  return {
    summary: parsed.summary || "AI选品分析完成",
    suggestions: (parsed.suggestions || []).map(s => ({
      product_name: s.product_name || "",
      hot_score: s.hot_score || 0,
      sales_growth: s.sales_growth || 0,
      price: s.price || 0,
      category: s.category || "",
      competition: s.competition || "",
      action: validateAction(s.action),
      reason: s.reason || "暂无详细理由",
      burst_probability: s.burst_probability || 0,
      estimated_profit_rate: s.estimated_profit_rate || 0,
      risk_level: validateRiskLevel(s.risk_level),
      risk_detail: s.risk_detail || "",
    })),
    topPick: undefined,
    generatedAt: new Date().toISOString(),
  };
}

/* ================================================================
   兜底：规则引擎选品
   ================================================================ */

function buildFallbackResult(products: ProductTrendRow[]): AIProductAnalysisResult {
  const suggestions: AIProductSuggestion[] = products.slice(0, 10).map(p => {
    let action: SuggestionAction = "暂时观察";
    let reason = "";
    let burstProbability = 40;
    let riskLevel: "低" | "中" | "高" = "中";

    if (p.sales_growth_rate >= 200 && p.competition_level === "低") {
      action = "立即跟进";
      reason = "销量爆发式增长，竞争低，建议立即跟进";
      burstProbability = 90;
      riskLevel = "低";
    } else if (p.sales_growth_rate >= 100 && p.competition_level !== "高") {
      action = "小批量测试";
      reason = "增长强劲，建议小批量测试验证市场";
      burstProbability = 75;
      riskLevel = "低";
    } else if (p.sales_growth_rate >= 50 && p.profit_margin_estimate >= 0.3) {
      action = "小批量测试";
      reason = "稳定增长且有利润空间，可小批量试水";
      burstProbability = 60;
      riskLevel = "中";
    } else if (p.trend_status === "下降" || p.sales_growth_rate < 0) {
      action = "不建议跟品";
      reason = "销量下滑，建议暂时不跟进";
      burstProbability = 10;
      riskLevel = "高";
    } else {
      action = "暂时观察";
      reason = "数据表现中等，建议观察后续趋势";
      burstProbability = 40;
      riskLevel = "中";
    }

    return {
      product_name: p.product_name,
      hot_score: p.hot_score,
      sales_growth: p.sales_growth_rate,
      price: p.price,
      category: p.category,
      competition: p.competition_level,
      action,
      reason,
      burst_probability: burstProbability,
      estimated_profit_rate: Math.round((p.profit_margin_estimate || 0) * 100),
      risk_level: riskLevel,
      risk_detail: p.competition_level === "高" ? "竞争激烈，需差异化策略" : p.trend_status === "下降" ? "趋势下行，不宜跟进" : "风险可控",
    };
  });

  suggestions.sort((a, b) => b.burst_probability - a.burst_probability);

  return {
    summary: `共分析${products.length}个商品，推荐${suggestions.filter(s => s.action !== "不建议跟品").length}个可跟进商品（规则引擎兜底）`,
    suggestions,
    topPick: suggestions[0],
    generatedAt: new Date().toISOString(),
  };
}

function validateAction(action: string): SuggestionAction {
  const valid: SuggestionAction[] = ["立即跟进", "小批量测试", "暂时观察", "不建议跟品"];
  return valid.includes(action as SuggestionAction) ? (action as SuggestionAction) : "暂时观察";
}

function validateRiskLevel(level: string): "低" | "中" | "高" {
  const valid = ["低", "中", "高"];
  return valid.includes(level) ? (level as "低" | "中" | "高") : "中";
}
