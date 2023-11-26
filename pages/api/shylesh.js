import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method === "GET") {
    // Handle GET request to read data.json
    const jsonFilePath = path.join(process.cwd(), "public", "data.json");

    fs.readFile(jsonFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        res.status(500).json({ error: "Failed to read JSON file" });
      } else {
        try {
          const jsonData = JSON.parse(data);
          res.status(200).json(jsonData);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          res.status(500).json({ error: "Failed to parse JSON data" });
        }
      }
    });
  } else if (req.method === "POST") {
    // Handle POST request to update data.json
    const jsonFilePath = path.join(process.cwd(), "public", "data.json");

    try {
      const newContent = req.body; // Assuming the new content is sent in the request body

      fs.writeFileSync(jsonFilePath, JSON.stringify(newContent, null, 2));

      res.status(200).json({ message: "Data updated successfully" });
    } catch (writeError) {
      console.error("Error writing to JSON file:", writeError);
      res.status(500).json({ error: "Failed to update JSON file" });
    }
  } else {
    res.status(404).json({ error: "Not Found" });
  }
}
