import mongoose from "mongoose";
import argon2 from "argon2";

/**
 * schema for note
 * type: text, image, sound
 * - text: content
 * - image: content, metadata
 * - sound: content, metadata
 * order: number default is 0
 */
const noteSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true,
        enum: ['text', 'image', 'sound'] 
    },
    order: { type: Number, default: 0 }
}, { 
    discriminatorKey: 'type',
    _id: true                 
});

const pageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: {
        type: String,
        required: true,
        default: 'Untitled'
    },
    notes: [noteSchema],
}, { timestamps: true });

const notesArray = pageSchema.path('notes') as mongoose.Schema.Types.DocumentArray;

notesArray.discriminator('text', new mongoose.Schema({
    content: { type: String, default: '' }
}));
notesArray.discriminator('image', new mongoose.Schema({
    content: { type: String, required: true },
    metadata: { caption: String }
}));
notesArray.discriminator('sound', new mongoose.Schema({
    content: { type: String, required: true },
    metadata: { title: String, duration: Number }
}));

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        trim: true,
        unique: true,
        minLength: 2,
        maxLength: 30
    },
    tagline: { 
        type: String, 
        required: true, 
        trim: true,
        match: [/^\d{4}$/, 'Tagline must be 4 digits']
    },
    password: { 
        type: String, 
        required: true
    },
    displayName: String,
    photoURL: String,
    fcmToken: String,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await argon2.hash(this.password);
        next();
    } catch (err: any) {
        next(err);
    }
});

// Verify password method
userSchema.methods.verifyPassword = async function (candidatePassword: string): Promise<boolean> {
    return argon2.verify(this.password, candidatePassword);
};

const Note = mongoose.model('Note', noteSchema);
const Page = mongoose.model('Page', pageSchema);
const User = mongoose.model('User', userSchema);

export { Note, Page, User };
