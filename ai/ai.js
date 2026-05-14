const axios = require("axios");

const MODELS = [

  "deepseek/deepseek-chat:free",

  "meta-llama/llama-3.3-8b-instruct:free",

  "inclusionai/ring-2.6-1t:free",

  "mistralai/mistral-7b-instruct:free",
];

async function askAI(message) {

  for (const model of MODELS) {

    try {

      console.log(
        `Trying: ${model}`
      );

      const response =
        await axios.post(

        "https://openrouter.ai/api/v1/chat/completions",

        {
          model,

          messages: [
            {
              role: "system",

              content:
                "You are a helpful medicine shop AI assistant.",
            },
            {
              role: "user",
              content: message,
            },
          ],
        },

        {
          headers: {

            Authorization:
`Bearer ${process.env.OPENROUTER_API_KEY}`,

            "Content-Type":
              "application/json",
          },
        }
      );

      return response.data
        .choices[0]
        .message.content;

    } catch (err) {

      console.log(
        `❌ Failed: ${model}`
      );

      console.log(

        err.response?.data ||
        err.message
      );
    }
  }

  return "❌ AI unavailable";
}

module.exports = askAI;
