import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.SUPABASE_URL!;
const supabaseKey: string = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);


export const api = {
    getScrums: async () => {
        const { data, error } = await supabase
            .from('scrums')
            .select('*');

        if (error) {
            console.error("Supabase Error fetching scrums:", error);
            throw error;
        }

        return data;
    },

    createScrum: async (scrumData: any) => {
        const { data, error } = await supabase
            .from('scrums')
            .insert([scrumData])
            .select(); 

        if (error) {
            console.error("Supabase Error creating scrum:", error);
            throw error;
        }

        return data[0];
    },

    getUsers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) {
            console.error("Supabase Error fetching users:", error);
            throw error;
        }

        return data;
    },

    createUser: async (userData: any) => {
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select(); 

        if (error) {
            console.error("Supabase Error creating user:", error);
            throw error;
        }

        return data[0];
    },

};