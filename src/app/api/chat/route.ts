import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export const runtime = "edge";

const SYSTEM_PROMPT = `你是直播投流AI助手，一个专业的广告投放顾问。你的职责：

1. 回答关于直播投流、广告投放、ROI优化的任何问题
2. 提供数据分析建议和策略指导
3. 解释投流术语（ROI、CTR、CPM、转化率等）
4. 帮助用户理解如何提升投放效果

规则：
- 回答简洁专业，用中文
- 适当使用emoji让对话更友好
- 涉及数字时给出具体建议
- 遇到不知道的直接说明

用户可能已经上传了投流数据，如有需要可以请用户到数据大屏查看具体数据。`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const messages = body.messages || [];
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return new Response(JSON.stringify({ error: "Message required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history (last 20 messages)
    const recentMessages = messages.slice(-20);
    for (const msg of recentMessages) {
      if (msg.role === "user" || msg.role === "assistant") {
        chatMessages.push({ role: msg.role, content: msg.content });
      }
    }
    chatMessages.push({ role: "user", content: userMessage });

    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "deepseek-chat",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}