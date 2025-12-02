// Import mongoose for MongoDB interaction
import mongoose from 'mongoose';
// Import bcrypt for password hashing (security)
import bcrypt from 'bcryptjs';

// Define the User schema (structure of User documents in MongoDB)
const userSchema = new mongoose.Schema({
    // Username field
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },

    // Email field
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    // Password field (hashed, never stored as plain text)
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false  // Don't return password in queries by default
    },

    // User's level (starts at 1)
    level: {
        type: Number,
        default: 1
    },

    // Experience points
    xp: {
        type: Number,
        default: 0
    },

    // Daily streak counter
    streak: {
        type: Number,
        default: 0
    },

    // Last time user was active
    lastActive: {
        type: Date,
        default: Date.now
    },

    // User's profile information
    profile: {
        bio: {
            type: String,
            default: '👨‍💻'  // Default emoji avatar
        }
    }
}, {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
});


// ===== MIDDLEWARE (Pre-save hook) =====
// Runs before saving a user document
userSchema.pre('save', async function(next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost factor of 12
        // Higher cost = more secure but slower
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch(err){}
});

// ===== INSTANCE METHODS =====
// Method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user leveled up
userSchema.methods.checkLevelUp = function() {
    const xpNeeded = this.level * 100 // 100, 200, 300 XP per level
    if (this.xp >= xpNeeded) {
        this.level += 1;
        return true;
    }
    return false;
};

// Create and export the User model
export default mongoose.model('User', userSchema);