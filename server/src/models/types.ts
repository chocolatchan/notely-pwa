interface Note {
    type: 'text' | 'image' | 'sound';
    order: number;
}

interface TextNote extends Note {
    type: 'text';
    content: string;
}

interface ImageNote extends Note {
    type: 'image';
    content: string;
    metadata: {
        caption: string;
    };
}

interface SoundNote extends Note {
    type: 'sound';
    content: string;
    metadata: {
        title: string;
        duration: number;
    };
}

type AnyNote = TextNote | ImageNote | SoundNote;

interface Page {
    title: string;
    notes: AnyNote[];
}

interface User {
    username: string;
    tagline: string;
    password: string;
    displayName: string;
    photoURL: string;
}

export { Note, TextNote, ImageNote, SoundNote, AnyNote, Page, User };