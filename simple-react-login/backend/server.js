const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Missing SUPERBASE_URL or SUPABASE_KEY in environment variables.');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Securely hash the password!
        const saltPattern = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltPattern);

        // Insert into Supabase
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                { 
                    email, 
                    name: name || 'User', 
                    password: hashedPassword 
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: 'Database error during registration' });
        }

        console.log(`User registered: ${email}`);
        res.status(201).json({ message: 'Registration successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            console.error('Supabase select error:', error);
            return res.status(500).json({ error: 'Database error during login' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify hashed password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log(`User logged in: ${email}`);
        // Return success info
        res.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, name: user.name }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

app.post('/api/analyze', async (req, res) => {
    try {
        const { text, userId } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Requirement text is required' });
        }

        const prompt = `You are an expert AI Requirement Clarification Assistant. Analyze the following software/project requirement.
Detect any missing details, identify conflicts or ambiguities, and generate a list of actionable follow-up questions to clarify the requirements with stakeholders.

Requirement:
${text}

Response Format:
Use Markdown. Start with a brief summary of the requirement. Then list missing details, conflicts, and follow-up questions.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'mixtral-8x7b-32768', 
        });

        const analysis = chatCompletion.choices[0]?.message?.content || "No analysis generated.";
        
        // Optionally save to Supabase if the user wants history
        if (userId) {
            const { error } = await supabase.from('requirements').insert([
                { user_id: userId, original_text: text, ai_analysis: analysis }
            ]);
            if (error) {
                console.error("Failed to save to database:", error);
            }
        }

        res.json({ analysis });

    } catch (err) {
        console.error('Groq Analysis Error:', err);
        res.status(500).json({ error: 'Failed to process requirement analysis.' });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
