    import express from 'express';
    import cors from 'cors';
    import dotenv from 'dotenv';
    import axios from 'axios';
    import pkg from 'pg';
    const { Pool } = pkg;

    dotenv.config();
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, 
      },
    });

    

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
    
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });
        if (prompt.length > 300) return res.status(400).json({ error: "Prompt is too long" });
    
        try {
            const { rows: data } = await pool.query('SELECT * FROM chatbot_data');
            const keywords = prompt.toLowerCase().split(" ");
    
            let systemPrompts = data
                .filter((item) => item.tags?.split(" ").some((tag) => keywords.includes(tag)))
                .map((item) => item.content);
    
            const chatbotInfoItem = data.find((item) => item.name === "Chatbot Information");
            const chatbotInfo = chatbotInfoItem ? chatbotInfoItem.content : "";
    
            if (chatbotInfo) systemPrompts.unshift(chatbotInfo);
            if (systemPrompts.length === 1 && chatbotInfo) systemPrompts = data.map((item) => item.content);
    
            const messages = [
                {
                    role: "system",
                    content: "You are Sigmund, a programming chatbot created by Daiben Sanchez, dedicated to addressing Sigma School or tech-related issues. Always respond in a friendly, casual manner.",
                },
                ...systemPrompts.map((content) => ({ role: "system", content })),
                { role: "user", content: prompt },
            ];
    
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4",
                    messages,
                    max_tokens: 500,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_KEY}`,
                    },
                }
            );
    
            const { prompt_tokens, completion_tokens, total_tokens } = response.data.usage;
            const reply = response.data.choices[0].message.content;
    
            res.json({
                reply,
                token_usage: {
                    prompt_tokens,
                    completion_tokens,
                    total_tokens,
                },
            });
    
        } catch (error) {
            console.error("Error generating text:", error?.response?.data || error.message || error);

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
