const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function quizGeneratorGPT(topic, numQuestion, difficultyLevel) {
  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `
You are a legal quiz generator.
You MUST return valid JSON only.
Each question must:
- Be based on the provided topic
- Match the difficulty level
- Have exactly 3 options (A, B, C)
- Have only ONE correct answer
- Be clear and unambiguous

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
        `,
      },
      {
        role: "user",
        content: `
Topic: ${topic}
Difficulty: ${difficultyLevel}
Number of questions: ${numQuestion}
        `,
      },
    ],
  });

  return response.choices[0].message.content;
}

module.exports = quizGeneratorGPT;
