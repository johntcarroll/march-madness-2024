// src/index.js
import express from "express";
import dotenv from "dotenv";
import { getTeams } from "./src/getTeams";
import { getTeam } from "./src/getTeam";
import { postTeam } from "./src/postTeam";
import { connectToMongo, disconnectFromMongo } from "./src/mongoUtils";
import { loggerConnect } from "./src/logger";
import { handleApiError } from "./src/globalErrorHandler";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(loggerConnect, handleApiError, connectToMongo, express.json());

app.get("/teams", getTeams);

app.get("/teams/:id", getTeam);

app.post("/teams/:id", postTeam);

app.use(disconnectFromMongo);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
