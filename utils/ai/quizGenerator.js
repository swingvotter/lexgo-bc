const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function quizGeneratorGPT(topic, numQuestion, difficultyLevel) {
  const seed = Math.random().toString(36).substring(2, 10);

  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `
You are a professional legal quiz generator.

CRITICAL RULES:
- Return VALID JSON ONLY
- Questions must be COMPLETELY UNIQUE
- Each question must cover a DIFFERENT concept
- Exactly 3 options: A, B, C
- Only ONE correct answer
- correctAnswer MUST be randomly A, B, or C
- Do NOT bias toward any letter

JSON format:
{
  "questions": [
    {
      "question": "",
      "answers": ["A", "B", "C"],
      "correctAnswer": "A"
    }
  ]
}
`
      },
      {
        role: "user",
        content: `
Topic: ${topic}
Difficulty: ${difficultyLevel}
Number of questions: ${numQuestion}
Randomization seed: ${seed}
`
      }
    ],
  });

  return response.choices[0].message.content;
}

module.exports = quizGeneratorGPT;
