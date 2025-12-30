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
You are an expert quiz generator.

Respond ONLY with valid JSON containing a single field:
- questions (array of question objects)

Each question must contain:
- question (string)
- options (array of exactly 3 strings)
- correct_answer (string: "A", "B", or "C" — letter of the correct option, where A is first, B is second, C is third)
- explanation (string) - A brief summary explanation of why the correct answer is correct

Instructions:
- Topic, difficulty, and number of questions are provided by the user.
- Questions must strictly match the provided topic and difficulty.
- All options must be clearly written and factually accurate.
- correct_answer must be 100% mathematically, logically, or scientifically correct.
- No guesswork or ambiguity.
- Distractors must be plausible but incorrect.

CRITICAL: Randomization Requirements:
- You MUST randomize the correct_answer letter ("A", "B", or "C") across ALL questions.
- The correct answer must NOT follow any pattern (e.g., not all "A", not alternating, not sequential).
- Distribute correct answers roughly evenly across letters "A", "B", and "C" throughout the quiz.
- Each question should have a DIFFERENT random letter for the correct answer.
- Use the randomization seed provided to ensure variety.

- Avoid vague, misleading, or trick phrasing.
- Never use "all of the above" or "none of the above".
- Use formal academic language.
- Include a brief explanation for each question explaining why the correct answer is correct.
- Do NOT include commentary or metadata — ONLY raw JSON.
- Ensure question diversity (definitions, problem solving, misconceptions, comparisons).
- Treat every request as unique and do not repeat questions.
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
