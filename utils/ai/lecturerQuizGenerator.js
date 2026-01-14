const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function lecturerQuizGenerator(
    textContent,
    numQuestions,
    difficultyLevel = "Mixed"
) {
    const seed = crypto.randomUUID(); // Better entropy than Math.random

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.9, // 🔥 Controls creativity & variation
        messages: [
            {
                role: "system",
                content: `
You are an expert educational content creator and quiz generator.

Respond ONLY with valid JSON:
{
  "questions": []
}

STRICT REQUIREMENTS:
- You MUST generate EXACTLY ${numQuestions} questions.
- Not fewer.
- Not more.
- If the text is limited, vary phrasing, focus, or depth to still reach ${numQuestions}.

Each question object MUST include:
- question (string)
- options (array of EXACTLY 4 strings)
- correct_answer ("A", "B", "C", or "D")
- explanation (string)

ANTI-REPETITION RULES:
- Avoid repeating the same question structure.
- Do not reuse identical wording.
- Focus on different details, implications, or interpretations.
- Assume the student may have taken a similar quiz before.

ANSWER RANDOMIZATION RULES:
- Shuffle correct answers randomly.
- No predictable patterns (A-B-C-D).
- No letter should repeat more than twice consecutively.

SOURCE RULE:
- Use ONLY the provided text as the source of truth.
- Do NOT invent facts outside the text.

OUTPUT RULE:
- No markdown.
- No commentary.
- Raw JSON only.
`
            },
            {
                role: "user",
                content: `
TEXT CONTENT:
${textContent.substring(0, 15000)}

TARGET QUESTIONS: ${numQuestions}
DIFFICULTY: ${difficultyLevel}
RANDOM SEED: ${seed}
`
            }
        ],
        response_format: { type: "json_object" },
    });

    return response.choices[0].message.content;
}

module.exports = lecturerQuizGenerator;
