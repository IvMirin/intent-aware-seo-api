import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let keyword, language;

  if (req.body) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      keyword = req.body.keyword;
      language = req.body.language || "en";
    } else if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        keyword = parsed.keyword;
        language = parsed.language || "en";
      } catch (e) {
        // Не удалось распарсить
      }
    }
  }

  if (!keyword && req.query.keyword) {
    keyword = req.query.keyword;
    language = req.query.language || "en";
  }

  if (!keyword) {
    return res.status(400).json({ 
      error: "keyword is required",
      debug: {
        bodyType: typeof req.body,
        body: req.body,
        query: req.query
      }
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an intent-aware SEO expert. Detect search intent, generate SEO title, meta description, and 3 social hooks. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: `Keyword: ${keyword}. Language: ${language}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);

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
