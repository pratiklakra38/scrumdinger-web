import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { handleGetScrums, handlePostScrum } from "./routes/scrums.ts"; 
import { handleSignUp, handleSignIn, handleLoginOrRegister } from "./routes/auth.ts"; 
import { createServer as createHttpServer } from "http";
import { setupWebSocket } from "./websocket";


dotenv.config({ path: '.env.secret' });
dotenv.config({ path: '.env.public', override: false }); 


export function createServer() {
    const app = express();
    app.use(cors());
    app.use(express.json()); 
    app.use(express.urlencoded({ extended: true }));


    app.get("/api/scrums", handleGetScrums);
    app.post("/api/scrums", handlePostScrum);
    app.post("/api/auth/signup", handleSignUp);
    app.post("/api/auth/signin", handleSignIn);
    app.post("/api/auth/login-or-register", handleLoginOrRegister);

    return app;
}

const app = createServer();
const httpServer = createHttpServer(app);
setupWebSocket(httpServer);
httpServer.listen(8081, () => {
  console.log("Server running on port 8081");
});