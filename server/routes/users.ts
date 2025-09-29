import { RequestHandler } from "express";
import { api } from "../db/supabaseService"; 


export const handleGetUsers: RequestHandler = async (req, res) => {
    try {
        const users = await api.getUsers(); 
        
        res.status(200).json({ users });
    } catch (err) {
        console.error("Error handling getUsers:", err.message);
        res.status(500).json({ error: "Failed to retrieve users" });
    }
};

export const handlePostUser: RequestHandler = async (req, res) => {
    try {
        const userData = req.body;
        
        const newUser = await api.createUser(userData); 
        
        res.status(201).json(newUser);
        
    } catch (err) {
        console.error("Error handling postUser:", err.message);
        res.status(500).json({ error: "Failed to create new user." });
    }
};