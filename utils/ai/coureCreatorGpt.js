const OpenAI = require("openai")

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function courseCreatorGpt(question) {
  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: "prompt here" },
      { role: "user", content: question }
    ],
  });

  console.log(response.choices[0].message.content);
  return response.choices[0].message.content
}

module.exports = courseCreatorGpt