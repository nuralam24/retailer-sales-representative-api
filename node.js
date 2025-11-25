import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.post("/hikvision", (req, res) => {
  console.log("📥 New event:", req.body);
  res.status(200).send("OK");
});

app.listen(9000, () => console.log("Server running on port 9000"));
