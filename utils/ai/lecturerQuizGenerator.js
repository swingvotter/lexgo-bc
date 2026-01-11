const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function lecturerQuizGenerator(textContent, numQuestions, difficultyLevel = "Mixed") {
    const seed = Math.random().toString(36).substring(2, 10);

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini", // Using a capable model
        messages: [
            {
                role: "system",
                content: `
You are an expert educational content creator and quiz generator.
Your task is to generate a quiz based strictly on the provided text content.

Respond ONLY with valid JSON containing a single field:
- questions (array of question objects)

Each question must contain:
- question (string)
- options (array of exactly 4 strings)
- correct_answer (string: "A", "B", "C", or "D" — letter of the correct option)
- explanation (string) - A brief explanation of why the answer is correct, referencing the provided text if possible.

Instructions:
- Use the provided text content as the source of truth.
- Generate approximately ${numQuestions} questions (or as many as the content supports up to that number).
- Difficulty: ${difficultyLevel}.
- Questions must be clear, unambiguous, and factually accurate based on the text.
- Distractors must be plausible.
- Randomize the correct answer position (A, B, C, D).
- Do NOT include any markdown formatting (like \`\`\`json), just the raw JSON object.

CRITICAL: Randomization Requirements:
- You MUST randomize the correct_answer letter ("A", "B", "C", "D") across ALL questions.
- Distribute correct answers roughly evenly.
`
            },
            {
                role: "user",
                content: `
Text Content:
${textContent.substring(0, 15000)} // Truncate to avoid context limit issues if necessary, though 4o-mini handles large context well.

Number of questions: ${numQuestions}
Difficulty: ${difficultyLevel}
Randomization seed: ${seed}
`
            }
        ],
        response_format: { type: "json_object" },
    });

    return response.choices[0].message.content;
}

module.exports = lecturerQuizGenerator;
