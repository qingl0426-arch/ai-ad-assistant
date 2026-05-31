import OpenAI from "openai";

interface AnalysisInput {
  spend: number;
  impressions: number;
  clicks: number;
  gmv: number;
  roi: number;
  orders: number;
  date: string;
  platform: string;
}

export interface AISuggestionResult {
  summary: string;
  suggestions: string[];
  risks: string[];
  optimizations: string[];
  budgetAdvice: string;
  confidence: number;
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }
  return client;
}

function buildPrompt(inputs: AnalysisInput[]): string {
  const total = inputs.reduce(
    (acc, i) => ({
      spend: acc.spend + i.spend,
      impressions: acc.impressions + i.impressions,
      clicks: acc.clicks + i.clicks,
      gmv: acc.gmv + i.gmv,
      orders: acc.orders + i.orders,
    }),
    { spend: 0, impressions: 0, clicks: 0, gmv: 0, orders: 0 },
  );
  const overallROI = total.spend > 0 ? ((total.gmv - total.spend) / total.spend) * 100 : 0;
  const ctr = total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0;
  const conversionRate = total.clicks > 0 ? (total.orders / total.clicks) * 100 : 0;

  const lines = inputs.map(
    (i) => `${i.date} | ${i.platform} | 消耗¥${i.spend} | 曝光${i.impressions} | 点击${i.clicks} | GMV¥${i.gmv} | 订单${i.orders} | ROI ${(i.roi * 100).toFixed(1)}%`,
  );

  return `你是直播投流分析专家。请分析以下 ${inputs.length} 天广告投放数据：

【汇总】
- 总消耗: ¥${total.spend.toLocaleString()}
- 总曝光: ${total.impressions.toLocaleString()}
- 总点击: ${total.clicks.toLocaleString()}
- 总GMV: ¥${total.gmv.toLocaleString()}
- 总订单: ${total.orders.toLocaleString()}
- 整体ROI: ${overallROI.toFixed(1)}%
- 整体CTR: ${ctr.toFixed(2)}%
- 整体转化率: ${conversionRate.toFixed(2)}%

【每日明细】
${lines.join("\n")}

请返回JSON格式（不要markdown代码块）:
{
  "summary": "一句话总结当前投放效果",
  "suggestions": ["投流建议1", "投流建议2", "投流建议3"],
  "risks": ["风险点1", "风险点2"],
  "optimizations": ["优化建议1", "优化建议2", "优化建议3"],
  "budgetAdvice": "预算调整建议",
  "confidence": 85
}`;
}

export async function generateAISuggestions(inputs: AnalysisInput[]): Promise<AISuggestionResult> {
  const openai = getClient();
  const prompt = buildPrompt(inputs);

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: "你是一个直播投流分析专家。始终返回纯JSON格式，不要markdown包裹。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    // Clean potential markdown wrappers
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed as AISuggestionResult;
  } catch (error) {
    console.error("OpenAI error:", error);
    return generateFallback(inputs);
  }
}

function generateFallback(inputs: AnalysisInput[]): AISuggestionResult {
  const total = inputs.reduce(
    (acc, i) => ({
      spend: acc.spend + i.spend,
      impressions: acc.impressions + i.impressions,
      clicks: acc.clicks + i.clicks,
      gmv: acc.gmv + i.gmv,
      orders: acc.orders + i.orders,
    }),
    { spend: 0, impressions: 0, clicks: 0, gmv: 0, orders: 0 },
  );
  const overallROI = total.spend > 0 ? ((total.gmv - total.spend) / total.spend) * 100 : 0;

  if (overallROI > 400) {
    return {
      summary: "ROI表现极佳，投放效果远超预期。",
      suggestions: ["建议扩大预算，追加高ROI时段投放", "复制成功素材到其他计划", "关注素材衰退周期，提前备投新素材"],
      risks: ["连续高ROI可能吸引过多竞争，成本可能上升", "单一素材疲劳风险"],
      optimizations: ["制作更多同类素材备用", "拓展相似受众定向", "增加投放时段覆盖"],
      budgetAdvice: "建议追加30-50%日预算，重点投入抖音平台高ROI时段。",
      confidence: 90,
    };
  }
  if (overallROI > 200) {
    return {
      summary: "ROI表现良好，投放效果稳定。",
      suggestions: ["维持当前预算，小幅优化", "测试新素材提升CTR", "优化落地页提升转化"],
      risks: ["市场竞争加剧风险", "素材表现可能波动"],
      optimizations: ["A/B测试新创意方向", "优化投放时段分布", "细分受众定向"],
      budgetAdvice: "建议保持现有预算，日增10-15%测试弹性。",
      confidence: 85,
    };
  }
  return {
    summary: "ROI偏低，需要优化投放策略。",
    suggestions: ["缩减低效计划预算", "更换创意素材", "调整受众定向"],
    risks: ["持续亏损风险", "流量质量不匹配", "转化链路断裂"],
    optimizations: ["关停ROI<1的计划", "重新设计落地页", "更换高转化话术", "检查商品定价策略"],
    budgetAdvice: "建议缩减30-50%预算，将资金集中到ROI>2的计划。",
    confidence: 80,
  };
}

