import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import formidable from "formidable";

import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());



const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});


app.post("/api/chat", async (req, res) => {

  try {
    const { message, level } = req.body;

    const prompt = `${message}`;
    // const completion = await client.chat.completions.create({
    //   model: "gpt-5",
    //   messages: [{ role: "user", content: prompt }],
    // });
    // console.log(completion.choices[0].message.content);

const response = await client.responses.create({
 model: "gpt-5-mini",
    input: prompt,
});

console.log(response.output_text);

 console.log(" xy ly client.chat.completions.create end");
    //res.json({ reply: completion.choices[0].message.content });
    res.json({ reply: response.output_text});
    
  } catch (err) {
    console.log(err);
    res.json({ reply: err.error.message });
   // res.status(err.status).json({ error: err.error.message });
  }
});

app.post("/api/speech", async (req, res) => {
  try {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Form parsing error" });

      const audio = files.audio;
      if (!audio) return res.status(400).json({ error: "No audio uploaded" });

      const transcript = await client.audio.transcriptions.create({
        file: audio.filepath,
        model: "gpt-4o-mini-tts",
      });

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an English tutor." },
          { role: "user", content: transcript.text },
        ],
      });

      res.json({
        transcript: transcript.text,
        reply: completion.choices[0].message.content,
      });
    });
  } catch (e) {
    res.status(500).json({ error: "Hai--Audio error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
