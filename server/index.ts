// src/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { getTeams } from "./src/getTeams";
import { getTeam } from "./src/getTeam";
import { postTeam } from "./src/postTeam";
import { connectToMongo, disconnectFromMongo } from "./src/mongoUtils";
import { loggerConnect } from "./src/logger";
import { handleApiError } from "./src/globalErrorHandler";
import { logRequestStart, logRequestEnd } from "./src/logRequest";
import { getHistory } from "./src/getHistory";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
  loggerConnect,
  logRequestStart,
  handleApiError,
  connectToMongo,
  express.json()
);

app.get("/teams", getTeams);

app.get("/teams/:id", getTeam);

app.post("/teams/:id", postTeam);

app.get("/history", getHistory);

app.use(disconnectFromMongo, logRequestEnd);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
