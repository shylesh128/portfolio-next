import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { TextField, Button, List, ListItem, ListItemText } from "@mui/material";
import axios from "axios";
import Loading from "@/components/Loading";

const ChatBox = () => {
  const router = useRouter();
  const { chatId } = router.query;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(""); // Retrieve the username from localStorage

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendMessagesToBackend = async (messages) => {
    try {
      const backendApiUrl = "/api/chat";

      const data = {
        chatId,
        messages,
        username, // Include the username in the data sent to the backend
      };

      console.log(data);
      await axios.post(backendApiUrl, data);

      console.log("Messages sent successfully!");
    } catch (error) {
      console.error("Error sending messages to the backend:", error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const timestamp = new Date().toISOString(); // Get the current timestamp
    const newMessage = `${username} - ${formatTimestamp(
      timestamp
    )}: ${message}`; // Include username and formatted timestamp in the message
    const arr = messages.concat(newMessage);
    setMessages(arr);
    sendMessagesToBackend(arr);
    setMessage("");
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    // Fetch old messages when the page loads
    const fetchOldMessages = async () => {
      try {
        const backendApiUrl = `/api/oldmessage?chatId=${chatId}`;
        const response = await axios.get(backendApiUrl);
        setMessages(response.data.messages);
        setLoading(false); // Mark loading as false once messages are fetched
      } catch (error) {
        console.error("Error fetching old messages:", error);
        setLoading(false); // Mark loading as false even if an error occurs
      }
    };

    if (chatId) {
      fetchOldMessages();
    }

    // Retrieve the username from localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [chatId]);

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
              <ListItemText primary={msg} />
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
