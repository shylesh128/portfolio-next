import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method === "GET") {
    const { chatId } = req.query;

    // Ensure chatId is provided in the request query
    if (!chatId) {
      return res.status(400).json({ error: "ChatId not provided" });
    }

    try {
      // Read the messages file using the chatId as the filename
      const messagesFile = path.join(
        process.cwd(),
        "messages",
        `${chatId}.json`
      );
      if (!fs.existsSync(messagesFile)) {
        return res.status(404).json({ error: "ChatId not found" });
      }

      // Read the contents of the messages file
      const messagesData = fs.readFileSync(messagesFile, "utf-8");

      // Parse the contents as JSON to get the messages array
      const messages = JSON.parse(messagesData);

      return res.status(200).json({ messages });
    } catch (error) {
      return res.status(500).json({ error });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
