const OpenAI = require("openai");
const crypto = require("crypto");

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
        model: "gpt-5-mini",
        max_completion_tokens: 10000, // Ensure no cutoff for large quizzes
        messages: [
            {
                role: "system",
                content: `
You are an expert educational content creator and quiz generator.

Respond ONLY with valid JSON satisfying this structure:
{
  "count": ${numQuestions},
  "questions": [ ... exactly ${numQuestions} items ... ]
}

STRICT REQUIREMENTS:
- You MUST generate EXACTLY ${numQuestions} multiple-choice questions.
- Every single question should be unique, distinct, and independent.
- High penalty for generating even one question less or more than ${numQuestions}.
- The "count" field in your JSON must be exactly ${numQuestions}.
- If the source text is short, create deeper, more specific questions (e.g., about terminology, specific nuances, or logical implications) to meet the exact count of ${numQuestions}.
- NEVER stop before reaching question #${numQuestions}.

Each question object MUST include:
- question (string)
- options (array of EXACTLY 4 strings)
- correct_answer ("A", "B", "C", or "D")
- explanation (string)

ANTI-REPETITION RULES:
- Avoid repeating the same question structure.
- Do not reuse identical wording.
- Focus on different details, implications, or interpretations.

ANSWER RANDOMIZATION RULES:
- Shuffle correct answers randomly.
- No letter (A, B, C, D) should repeat more than twice consecutively.

SOURCE RULE:
- Use ONLY the provided text as the source of truth.

OUTPUT RULE:
- Raw JSON only. No markdown, no commentary.
`
            },
            {
                role: "user",
                content: `
Generate exactly ${numQuestions} multiple-choice questions from the text below. 

DIFFICULTY: ${difficultyLevel}
TARGET COUNT: ${numQuestions} (Strict Requirement)

TEXT CONTENT:
${textContent.substring(0, 15000)}

REMINDER: Your JSON response must contain exactly ${numQuestions} question objects. Check your count before finishing.
`
            }
        ],
        response_format: { type: "json_object" },
    });

    return response.choices[0].message.content;
}

module.exports = lecturerQuizGenerator;
