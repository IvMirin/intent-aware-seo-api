import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { keyword, language = "en" } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: "keyword is required" });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an intent-aware SEO expert. Detect search intent, generate SEO title, meta description, and 3 social hooks. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: `Keyword: ${keyword}. Language: ${language}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(
      completion.choices[0].message.content
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      error: "AI generation failed",
      details: err.message
    });
  }
}
