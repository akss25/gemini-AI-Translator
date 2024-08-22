const express = require("express");
const dotenv = require("dotenv").config();
const colors = require("colors");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const { SaveHistory, getHistory } = require("./controllers"); // Assuming this is defined
const { connectDB } = require("./config"); // Corrected import

connectDB();

const PORT = process.env.PORT || 5001;

const app = express();
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_KEY,
});
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the route to handle translation requests
app.use("/get-translation", async (req, res) => {
  const language = req.query.language;
  const message = req.query.message;
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
    You will be provided with statements or word/s in a specific language.
    1. Detect the specific language of the message: "${message}".
    2. Correct any grammatical or spelling errors in the sentence/word, and rewrite it if necessary.
    3. Translate the corrected sentence/word into: ${language}.
    4. If the input contains any offensive content, provide a warning about it in the output.
    5. Return the response in the following JSON format:
    {
      "corrected_sentence": "Corrected sentence in the original language",
      "translation": "Translated sentence in the target language",
      "date": "Current date",
      "translate_from_language": "Detected language",
      "translated_to_language": "Target language",
      "translate_from_text": "Original text",
      "translated_to_text": "Translated text"
    }
  `;

  try {
    const result = await model.generateContent(prompt);

    // Parse the response text into JSON format
    let responseContent;
    try {
      responseContent = JSON.parse(result.response.text());
    } catch (error) {
      console.error("Error parsing JSON content:", error);
      responseContent = { error: "Failed to parse response as JSON" };
    }

    // Send the parsed content as the response
    res.status(200).json(responseContent);
    SaveHistory(responseContent); // Assuming SaveHistory handles the data
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Error generating translation." });
  }
});

const speechFile = path.resolve("./speech.mp3");

app.use("/get-translation-speech", async (req, res) => {
  const translation = req.query.translation;
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: translation,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    res.status(200).send(buffer);
  } catch (error) {
    console.error("Error generating audio:", error);
    res.status(500).send("Error generating audio.");
  }
});

// Get all the History
app.use("/get-history", getHistory);

// Frontend configuration
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) =>
    res.sendFile(
      path.resolve(__dirname, "../", "frontend", "dist", "index.html")
    )
  );
} else {
  app.get("/", (req, res) => res.send("Please Activate Production"));
}

// Start the server
app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
