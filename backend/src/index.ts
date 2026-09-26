import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

import express, { Express, Request, Response } from "express";

import { connectDB } from "./db/connectDB";
import authRoutes from "./routes/auth.route";
import notesRoutes from "./routes/notes.route";
import treeNodeRoutes from "./routes/treeNode.route";
import treeRoutes from "./routes/tree.route";
import healthRoutes from "./routes/health.route";
import supportRoutes from "./routes/support.route";
import usersRoutes from "./routes/users.route";
import { apiLimiter } from "./middleware/rateLimiters";

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL, // prod Vercel URL
  process.env.CLIENT_URL_DEV, // preview Vercel URL or pattern
].filter(Boolean);

const isVercelPreview = (origin: string) =>
  // ! Note: This is a simple heuristic to allow Vercel preview deployments to access the API.
  // ! It assumes that the preview URLs follow the pattern "https://blackcloud-notes-frontend-<random-string>.vercel.app".
  // ! Adjust this logic if your deployment patterns change.
  origin.startsWith("https://blackcloud-notes-frontend- ") &&
  origin.endsWith(".vercel.app");

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isVercelPreview(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
// Added to support base64-encoded images embedded in note content
// Note: MongoDB document size limit is 16mb — monitor note sizes if users
// report save failures on image-heavy notes.
app.use(express.json({ limit: "10mb" }));
app.use("/api/health", healthRoutes);
app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/treeNodes", treeNodeRoutes);
app.use("/api/tree", treeRoutes);
app.use("/api/support", supportRoutes);
app.use("/public", express.static("public"));

app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening on port ${PORT}`);
});
