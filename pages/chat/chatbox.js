import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { TextField, Button, List, ListItem, ListItemText } from "@mui/material";
import axios from "axios";
import Loading from "@/components/Loading";
import io from "socket.io-client";

const ChatBox = () => {
  const router = useRouter();
  const { chatId } = router.query;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = io("http://localhost:5000");

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prevMessages) => {
        // Check if the message already exists in the messages list
        const existingMessage = prevMessages.find(
          (msg) => msg.text === data.text
        );
        if (!existingMessage) {
          return [...prevMessages, data];
        }
        return prevMessages;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendMessagesToBackend = async (messages) => {
    try {
      const backendApiUrl = "/api/chat";

      const data = {
        chatId,
        messages,
      };

      await axios.post(backendApiUrl, data);

      console.log("Messages sent successfully!");
    } catch (error) {
      console.error("Error sending messages to the backend:", error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const timestamp = new Date().toISOString();
    const user = "shylesh" || "No body";
    const newMessage = {
      text: message,
      timestamp,
      user,
    };

    const arr = messages.concat(newMessage);
    setMessages(arr);
    sendMessagesToBackend(arr);
    setMessage("");

    socket.emit("message", newMessage);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="chat-container">
      <h1 className="chat-title">
        Welcome to the Chat Room {chatId ? `#${chatId}` : ""}
      </h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <List className="chat-messages">
          {messages.map((msg, index) => (
            <ListItem key={index} className="chat-message">
              <ListItemText
                primary={`${msg.user}: ${msg.text}`}
                secondary={new Date(msg.timestamp).toLocaleTimeString()}
              />
            </ListItem>
          ))}
        </List>
        <form onSubmit={handleSubmit} className="chat-form">
          <div className="chat-input-container">
            <TextField
              label="Type your message"
              variant="outlined"
              fullWidth
              value={message}
              onChange={handleMessageChange}
              className="chat-input-text"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className="chat-send-button"
            >
              Send
            </Button>
          </div>
        </form>
      </motion.div>
      <style jsx>{`
        .chat-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background-color: #f5f5f5;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .chat-title {
          color: #212121;
          text-align: center;
          margin-bottom: 20px;
        }

        .chat-messages {
          max-height: 400px;
          overflow-y: auto;
          list-style: none;
          padding: 0;
          margin-bottom: 20px;
        }

        .chat-message {
          background-color: #f0f0f0;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 10px;
        }

        .chat-form {
          display: flex;
          align-items: center;
          flex-grow: 1;
        }

        .chat-input-container {
          display: flex;
          flex-grow: 1;
        }

        .chat-input-text {
          background-color: #ffffff;
          border-radius: 8px 0 0 8px;
        }

        .chat-send-button {
          border-radius: 0 8px 8px 0;
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
