import { RequestHandler } from "express";
import { api } from "../db/supabaseService"; 


export const handleSignUp: RequestHandler = async (req, res) => {
    try {
        const { email, password } = req.body; 

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required for sign-up." });
        }
        
        const data = await api.signUpUser(email, password); 
        
        if (data.user && !data.session) {
            return res.status(202).json({ 
                message: "Account created. Please check your email to confirm registration."
            });
        }

        res.status(201).json(data);
        
    } catch (err) {
        console.error("Error handling sign-up:", err.message);
        res.status(400).json({ error: err.message });
    }
};

export const handleSignIn: RequestHandler = async (req, res) => {
    try {
        const { email, password } = req.body; 

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required for sign-in." });
        }
        
        const data = await api.signInUser(email, password); 
        
        if (!data.session) {
            return res.status(401).json({ error: "Invalid credentials or user not confirmed." });
        }

        res.status(200).json(data);
        
    } catch (err) {
        console.error("Error handling sign-in:", err.message);
        res.status(401).json({ error: err.message }); 
    }
};

export const handleLoginOrRegister: RequestHandler = async (req, res) => {
    try {
        const { email, password } = req.body; 

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const userExists = await api.userExists(email);
        let sessionData: any;

        if (userExists) {
            try {
                sessionData = await api.signInUser(email, password);
            } catch (e) {
                return res.status(401).json({ error: e.message || "Invalid credentials." });
            }

        } else {
            try {
                sessionData = await api.signUpUser(email, password);
                
                if (sessionData.user && !sessionData.session) {
                    return res.status(202).json({ 
                        message: 'Account created! Please check your email to log in.',
                        requiresConfirmation: true
                    });
                }
            } catch (e) {
                return res.status(400).json({ error: e.message || "Registration failed." });
            }
        }

        return res.status(200).json(sessionData);

    } catch (err) {
        console.error("FATAL Server Error in Login/Register:", err.message);
        res.status(500).json({ error: "An unexpected server error occurred." });
    }
};