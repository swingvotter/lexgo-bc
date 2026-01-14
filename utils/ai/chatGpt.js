const OpenAI = require("openai")

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function chatGpt(question) {
  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: "You answer questions clearly." },
      { role: "user", content: question }
    ],
  });


  return response.choices[0].message.content
}

module.exports = chatGpt