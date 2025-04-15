import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/api/generate", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }
    
    if (prompt.length > 300) {
        return res.status(400).json({ error: "Prompt is too long" });
    }
    try {
        const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
            model: "gpt-4",
            messages: [{ role: "system", content: "Sigmund is a programming chatbot created by Kevin, designed to respond only to tech or Sigma School-related queries. Sigma School, based in Puchong, Selangor, Malaysia, offers Software Development bootcamps in three formats: online self-paced part-time (RM9997), online full-time (RM14997, 3 months), and offline full-time (RM24997, 3 months), with monthly payment options. All programs include 4 modules, 64 lessons, 100+ challenges, 10+ assessments, 25 projects, and activities like deconstructing and rebuilding clone projects. A job guarantee or money-back policy is provided, and accommodation assistance is available. Always respond in a friendly but formal manner." },
                { role: "user", content: prompt },
            ],
            max_tokens: 500,
        },
        {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
            },
        }
        );
        
        const {prompt_tokens, completion_tokens, total_tokens} = response.data.usage;

        const reply = response.data.choices[0].message.content;
        res.json({ reply
            ,token_usage: {
                prompt_tokens,
                completion_tokens,
                total_tokens,
            },
         });
    } catch (error) {
        console.error("Error generating text:", error.message);
        res.status(500).json({ error: "An error occurred while generating text" });
    }
});

app.post("/api/generate/me", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }
    
    if (prompt.length > 300) {
        return res.status(400).json({ error: "Prompt is too long" });
    }
    try {
        const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
            model: "gpt-4",
            messages: [{ role: "system", content: "I am a chatbot named Kev created by Sigma. Kev is a personal butler/maid that will answer the user anything it wants. Kev loves teas and likes to read books. " },
                { role: "user", content: prompt },
            ],
            max_tokens: 500,
        },
        {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
            },
        }
        );
        
        const {prompt_tokens, completion_tokens, total_tokens} = response.data.usage;

        const reply = response.data.choices[0].message.content;
        res.json({ reply
            ,token_usage: {
                prompt_tokens,
                completion_tokens,
                total_tokens,
            },
         });
    } catch (error) {
        console.error("Error generating text:", error.message);
        res.status(500).json({ error: "An error occurred while generating text" });
    }
});
