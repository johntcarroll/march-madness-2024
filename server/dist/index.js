"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.js
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const getTeams_1 = require("./src/getTeams");
const getTeam_1 = require("./src/getTeam");
const postTeam_1 = require("./src/postTeam");
const mongoUtils_1 = require("./src/mongoUtils");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.get("/teams", mongoUtils_1.connectToMongo, getTeams_1.getTeams, mongoUtils_1.disconnectFromMongo);
app.get("/teams/:id", mongoUtils_1.connectToMongo, getTeam_1.getTeam, mongoUtils_1.disconnectFromMongo);
app.post("/teams/:id", mongoUtils_1.connectToMongo, postTeam_1.postTeam, mongoUtils_1.disconnectFromMongo);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
