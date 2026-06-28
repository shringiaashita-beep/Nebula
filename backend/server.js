const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const apiKeysRouter = require("./routes/apiKeys");
const aiRouter = require("./routes/ai");

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use("/api/", limiter);

// Mount Routes
app.use("/api/keys", apiKeysRouter);
app.use("/api/ai", aiRouter);

app.get("/", (req, res) => {
  res.send("AI Study Planner API Running - Secure BYOK Enabled");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});