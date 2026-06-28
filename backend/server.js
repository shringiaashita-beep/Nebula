const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const apiKeysRouter = require("./routes/apiKeys");
const aiRouter = require("./routes/ai");

const app = express();

// Security Middleware
app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nebula-eta-three.vercel.app",
      // Add your custom domain here later
      // "https://nebula.study"
    ],
    credentials: true,
  })
);

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Routes
app.use("/api/keys", apiKeysRouter);
app.use("/api/ai", aiRouter);

app.get("/", (req, res) => {
  res.send("Nebula Backend API Running 🚀");
});

// IMPORTANT FOR RENDER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
