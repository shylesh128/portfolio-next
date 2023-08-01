import fs from "fs";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { chatId, messages } = req.body;
    if (!chatId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ chatId, messages });
    }

    try {
      const messagesString = JSON.stringify(messages);
      fs.writeFileSync(`./messages/${chatId}.json`, messagesString);

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
