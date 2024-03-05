// src/index.js
import express from "express";
import dotenv from "dotenv";
import { getTeams } from "./src/server/getTeams";
import { getTeam } from "./src/server/getTeam";
import { postTeam } from "./src/server/postTeam";
import { connectToMongo, disconnectFromMongo } from "./src/server/mongoUtils";
import { loggerConnect } from "./src/server/logger";
import { handleApiError } from "./src/server/globalErrorHandler";
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
