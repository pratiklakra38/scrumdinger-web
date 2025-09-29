import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleGetScrums, handlePostScrum } from "./routes/scrums.ts"; 
import { handleGetUsers, handlePostUser } from "./routes/users.ts"; 
// Assuming handleDemo is defined and imported elsewhere, as per previous discussion
// import { handleDemo } from "./routes/demo.ts"; 


export function createServer() {
    const app = express();
    app.use(cors());
    app.use(express.json()); 
    app.use(express.urlencoded({ extended: true }));


    app.get("/api/scrums", handleGetScrums);
    app.post("/api/scrums", handlePostScrum);
    app.get("/api/users", handleGetUsers);
    app.post("/api/users", handlePostUser);


    return app;
}