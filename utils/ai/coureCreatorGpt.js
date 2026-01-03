const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function courseCreatorGpt(combinedContent) {
  const systemPrompt = `You are an expert course author. Create a comprehensive course JSON that exactly matches the following schema keys and structure (do NOT add extra top-level keys):

{
  "title": "string, course title",
  "introduction": "string, short introduction",
  "chapters": [
    {
      "title": "string, chapter title",
      "learningObjectives": ["array of strings"],
      "content": "string, chapter content",
      "authorities": [
        { "type": "string, authority type (statute/case/etc)", "reference": "string", "note": "string (optional)" }
      ]
    }
  ]
}

Use the combined course material content below as the only source. Produce well-structured, reasonable chapters, learning objectives and authorities where applicable. Keep chapter count between 3 and 12. Ensure every chapter has a non-empty title and content. Output ONLY valid JSON (no markdown or explanatory text).

SOURCE CONTENT:
"""
${combinedContent}
"""`;

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Return ONLY the JSON that conforms to the schema." },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    return content ? content.trim() : "";
  } catch (err) {
    console.error("courseCreatorGpt error:", err);
    throw err;
  }
}

module.exports = courseCreatorGpt;