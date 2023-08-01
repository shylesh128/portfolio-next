import { useState } from "react";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  const [chatId, setChatId] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (chatId.trim() !== "" && username.trim() !== "") {
      // Store the chatId and username in localStorage
      localStorage.setItem("chatId", chatId);
      localStorage.setItem("username", username);
      router.push(`/chat/chatbox?chatId=${chatId}`);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Enter Chat ID</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Chat ID"
            className="input"
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="input"
          />
          <button type="submit" className="start-chat-btn">
            Start Chat
          </button>
        </form>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: var(--background-color);
          color: var(--text-color);
        }

        .card {
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          background-color: var(--background-color);
          max-width: 400px;
          width: 100%;
        }

        h1 {
          margin-bottom: 20px;
          font-size: 2rem;
          text-align: center;
        }

        form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        input {
          margin-bottom: 10px;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 5px;
          width: 100%;
          max-width: 300px;
        }

        button {
          padding: 14px 30px;
          background-color: var(--link-color);
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .card {
            padding: 20px;
          }

          h1 {
            font-size: 1.5rem;
          }

          input {
            padding: 10px;
          }

          button {
            padding: 12px 25px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
