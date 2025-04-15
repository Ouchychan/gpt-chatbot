import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const userMessage = {text: prompt, sender: "user"};
    setMessages([...messages, userMessage]);

    try {
      const res = await axios.post("http://localhost:3000/api/generate", {
        prompt,
      });

      const data = await res.data;
      if (data.reply) {
        const aiMessage = {text: data.reply, sender: "ai"};
        setMessages([...messages, userMessage, aiMessage]);
        setPrompt("");
      } else {
        throw new Error("Unexpected response format from server.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div className="container">
      <div className="row col-lg-12 text-center">
        <div className="header-container">
          <h1 className="text-center my-4">Sigmund</h1>
          <p>The Sigma School chatbot</p>
        </div>
      </div>
      <div className="row col-lg-12">
        <div className ="chat-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          </div>
        <form className="form-container" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control row "
            placeholder="Type your message..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>
        {error && <div className="mt-4 alert alert-danger">{error}</div>}
      </div>
    </div>
  );
}

export default App;