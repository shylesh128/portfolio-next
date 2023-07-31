import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // Check if the request is for the specific route you want to handle
  if (req.method === "GET") {
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
  } else {
    // If the route doesn't match, return a 404 Not Found response
    res.status(404).json({ error: "Not Found" });
  }
}
