// Import dependencies
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment varables
dotenv.config();

// Initialize Express app
const app = express()

// Middleware - Explain each one:
app.use(cors()); // Allows frontend to communicate with backend
app.use(express.json()); // Parses incoming JSON data

// Basic test route
app.get('/', (req, res) => {
    res.json({
        message: 'Skill Stack API is running!',
        timestamp: new Date().toISOString()
    });
});

// Database connection
mongoose.connect(process.env.MONDODB_URI || 'mongodb://localhost:27017/skill-stack')
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🎯 Skill Stack server running on port ${PORT}`);
    console.log(`📍 API available at: http://localhost:${PORT}`);
});