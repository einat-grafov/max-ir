import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, title, excerpt, body_content } = await req.json();
    console.log("cms-ai-generate type:", type);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const contentSnippet = (body_content || "").substring(0, 6000);
    const context = `PAGE TITLE: ${title || "Untitled"}\n${
      excerpt ? `EXCERPT: ${excerpt}\n` : ""
    }\nPAGE CONTENT (extracted from this page's hero, sections, and body — this is the source of truth):\n${
      contentSnippet || "(no body content available — base your output strictly on the page title)"
    }`;

    let systemPrompt = "";
    let toolDef: any = null;
    let toolChoice: any = null;

    if (type === "summary") {
      systemPrompt =
        "You are an SEO and AI search optimization expert for MAX-IR Labs, a company building infrared spectroscopic sensors for water, food, blood and energy applications. Analyze the provided content and extract structured metadata for AI search readiness. Be factual, clear, concise, and grounded in the source — do not hallucinate.";
      toolDef = {
        type: "function",
        function: {
          name: "extract_ai_metadata",
          description: "Extract AI search metadata from content",
          parameters: {
            type: "object",
            properties: {
              primary_topic: { type: "string", description: "Single normalized topic phrase (2-5 words)" },
              supporting_topics: { type: "array", items: { type: "string" }, description: "3-6 supporting topic phrases" },
              key_entities: { type: "array", items: { type: "string" }, description: "5-12 key entities mentioned" },
              ai_summary: { type: "string", description: "Factual summary, 80-140 words, for AI consumption" },
            },
            required: ["primary_topic", "supporting_topics", "key_entities", "ai_summary"],
            additionalProperties: false,
          },
        },
      };
      toolChoice = { type: "function", function: { name: "extract_ai_metadata" } };
    } else if (type === "faq") {
      systemPrompt =
        "You are an FAQ generation expert. Generate 3-5 frequently asked questions based strictly on the provided content. Questions should match real user search intent, not marketing language. Answers should be short, clear, and based only on the page content. Do not hallucinate.";
      toolDef = {
        type: "function",
        function: {
          name: "generate_faqs",
          description: "Generate FAQ items from content",
          parameters: {
            type: "object",
            properties: {
              faq_items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" },
                  },
                  required: ["question", "answer"],
                  additionalProperties: false,
                },
              },
            },
            required: ["faq_items"],
            additionalProperties: false,
          },
        },
      };
      toolChoice = { type: "function", function: { name: "generate_faqs" } };
    } else if (type === "og") {
      systemPrompt = [
        "You are a senior brand copywriter for MAX-IR Labs, a company building infrared spectroscopic sensors for water, food, blood and energy industries.",
        "Write Open Graph (OG) metadata for sharing the given page on Facebook, LinkedIn, Slack, WhatsApp, and Twitter.",
        "",
        "STRICT RULES:",
        "1. Use ONLY information present in the provided PAGE TITLE and PAGE CONTENT. Do not invent facts, products, statistics, client names, or claims that are not in the source.",
        "2. The OG title must reflect what the page is actually about — reuse key phrases or the topic from the page content. Max 60 characters. No emoji. No generic marketing fluff.",
        "3. The OG description must be a faithful summary of the page's actual offering or content, 90-160 characters, conversational but grounded.",
        "4. If the page content is sparse or only contains the title, write a clear, factual summary based on the title — do NOT fabricate detail to fill space.",
        "5. For the image suggestion: describe the ideal hero image based on the page's actual subject. Provide both a plain-English prompt and 3-6 short keywords.",
      ].join("\n");
      toolDef = {
        type: "function",
        function: {
          name: "generate_og_metadata",
          description: "Generate Open Graph metadata for social sharing",
          parameters: {
            type: "object",
            properties: {
              og_title: { type: "string", description: "Punchy share title, max 60 chars" },
              og_description: { type: "string", description: "Share description, 90-160 chars" },
              image_prompt: {
                type: "string",
                description: "Plain-English description of the ideal hero image (subject, mood, style).",
              },
              image_keywords: {
                type: "array",
                items: { type: "string" },
                description: "3-6 short keywords describing the ideal image.",
              },
            },
            required: ["og_title", "og_description", "image_prompt", "image_keywords"],
            additionalProperties: false,
          },
        },
      };
      toolChoice = { type: "function", function: { name: "generate_og_metadata" } };
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context },
        ],
        tools: [toolDef],
        tool_choice: toolChoice,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No tool call returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cms-ai-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
