import { RequestHandler } from "express";
import { api } from "../db/supabaseService"; 


export const handleGetScrums: RequestHandler = async (req, res) => {
    try {
        const scrums = await api.getScrums(); 
        
        res.status(200).json({ scrums });
    } catch (err) {
        console.error("Error handling getScrums:", err.message);
        res.status(500).json({ error: "Failed to retrieve scrum data." });
    }
};

export const handlePostScrum: RequestHandler = async (req, res) => {
    try {
        const scrumData = req.body; 
        
        // if (!scrumData || !scrumData.id || !scrumData.name) {
        //     return res.status(400).json({ error: "Missing required fields for new scrum." });
        // }
        
        const newScrum = await api.createScrum(scrumData); 
        
        res.status(201).json(newScrum);
        
    } catch (err) {
        console.error("Error handling postScrum:", err.message);
        res.status(500).json({ error: "Failed to create new scrum." });
    }
};