import { createClient, SupabaseClient } from "@supabase/supabase-js";


let supabase: SupabaseClient | null = null;
let supabaseAdmin: SupabaseClient | null = null;

function initializeClient() {
    if (supabase && supabaseAdmin) return;

    const supabaseUrl: string | undefined = process.env.SUPABASE_URL;
    const supabaseKey: string | undefined = process.env.SUPABASE_KEY;
    const supabaseAdminKey: string | undefined = process.env.SUPABASE_ADMIN_KEY; 


    if (!supabaseUrl || !supabaseKey || !supabaseAdminKey) {
        throw new Error("❌ Missing SUPABASE environment variables.");
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        }
    });
}


export const api = {

    getScrums: async () => {
        initializeClient(); 
        const { data, error } = await supabase! 
            .from('scrums')
            .select('*');

        if (error) { console.error("Supabase Error fetching scrums:", error); throw error; }
        return data;
    },

    createScrum: async (scrumData: any) => {
        initializeClient(); 
        const { data, error } = await supabase!
            .from('scrums')
            .insert([scrumData])
            .select(); 

        if (error) { console.error("Supabase Error creating scrum:", error); throw error; }
        return data[0];
    },

    getUsers: async () => {
        initializeClient();
        const { data, error } = await supabase! 
            .from('users')
            .select('*');

        if (error) { console.error("Supabase Error fetching users:", error); throw error; }
        return data;
    },

    createUser: async (userData: any) => {
        initializeClient();
        const { data, error } = await supabase!
            .from('users')
            .insert([userData])
            .select(); 

        if (error) { console.error("Supabase Error creating user:", error); throw error; }
        return data[0];
    },

    signUpUser: async (email: string, password: string) => {
        initializeClient();
        const { data, error } = await supabase!.auth.signUp({
            email: email,
            password: password,
        });

        if (error) { console.error("Supabase SignUp Error:", error); throw error; }
        return data;
    },

    signInUser: async (email: string, password: string) => {
        initializeClient();
        const { data, error } = await supabase!.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) { console.error("Supabase SignIn Error:", error); throw error; }
        return data;
    },

    getUserFromToken: async (token: string) => {
        initializeClient();
        const { data, error } = await supabase!.auth.getUser(token);

        if (error) { console.error("Supabase GetUser Error:", error); throw error; }
        return data;
    },

    userExists: async (email: string) => {
        initializeClient();
        const { data, error } = await supabaseAdmin!.auth.admin.listUsers({
            email: email
        }as any);

        if (error) { console.error("Supabase Admin listUsers error:", error); throw error; }

        if (data.users.length === 0) { return false; }
    
        const exists = data.users.some((user: { email?: string }) => user.email && user.email.toLowerCase() === email.toLowerCase());
    
        return exists; 
    },

};