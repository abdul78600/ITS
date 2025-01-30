import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Test API Route
app.get("/", (req, res) => {
    res.send("IT Management System API is running...");
});

// Get all assets
app.get("/api/assets", async (req, res) => {
    const assets = await prisma.asset.findMany();
    res.json(assets);
});

// Get all tickets
app.get("/api/tickets", async (req, res) => {
    const tickets = await prisma.ticket.findMany();
    res.json(tickets);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
