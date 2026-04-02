import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Image as ImageIcon, Mic } from 'lucide-react';
import { LocalNote } from '../lib/db';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteBlockProps {
  note: LocalNote;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  onTriggerImage: () => void;
  onTriggerSound: () => void;
}

const NoteBlock: React.FC<NoteBlockProps> = ({ note, onUpdate, onDelete, onTriggerImage, onTriggerSound }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [showCommands, setShowCommands] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : (showCommands || isEditing ? 50 : 1),
    position: 'relative' as const,
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      autoResize(textareaRef.current);
    }
  }, [isEditing]);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleBlur = () => {
    setTimeout(() => {
        setIsEditing(false);
        setShowCommands(false);
        if (content !== note.content) onUpdate(note.id!, content);
    }, 150);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    autoResize(e.target);
    
    if (val.endsWith('/')) {
        setShowCommands(true);
    } else {
        setShowCommands(false);
    }
  };

  const handleCommand = (type: 'image' | 'sound') => {
    const newContent = content.replace(/\/$/, '');
    setContent(newContent);
    onUpdate(note.id!, newContent);
    setShowCommands(false);
    setIsEditing(false);
    if (type === 'image') onTriggerImage();
    if (type === 'sound') onTriggerSound();
  };

  // ── Image Block ──
  if (note.type === 'image') {
    return (
      <div 
        ref={setNodeRef} 
        style={{ ...style, paddingTop: 8, paddingBottom: 8 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div {...attributes} {...listeners} 
          style={{ 
            position: 'absolute', left: -28, top: 12, 
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s',
            cursor: 'grab', color: 'var(--text-faint)'
          }} 
        >
          <GripVertical size={16} />
        </div>
        
        <div style={{ borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
          <img src={note.content} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
          {isHovered && (
             <button 
               onClick={() => onDelete(note.id!)}
               style={{ position: 'absolute', top: 8, right: 8, padding: 6, borderRadius: 6, background: '#FFF', color: '#111', boxShadow: 'var(--shadow-sm)' }}
             >
               <Trash2 size={14} />
             </button>
          )}
        </div>
      </div>
    );
  }

  // ── Sound Block ──
  if (note.type === 'sound') {
    return (
      <div 
        ref={setNodeRef} 
        style={{ ...style, paddingTop: 12, paddingBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div {...attributes} {...listeners} 
          style={{ 
            position: 'absolute', left: -28, top: 22, 
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s',
            cursor: 'grab', color: 'var(--text-faint)'
          }} 
        >
          <GripVertical size={16} />
        </div>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 12 }}>
          <Mic size={20} color="var(--text-muted)" />
          {/* Use the provided string in note.content which could be base64 or remote URL */}
          <audio controls src={note.content} style={{ flex: 1, height: 36, outline: 'none' }} />
          
          {isHovered && (
             <button 
               onClick={() => onDelete(note.id!)}
               style={{ padding: 6, borderRadius: '50%', color: 'var(--text-muted)' }}
               className="hover:bg-white transition-colors"
             >
               <Trash2 size={16} />
             </button>
          )}
        </div>
      </div>
    );
  }

  // ── Text Block ──
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Absolute Grip Handle (does not break layout) */}
      <div 
        {...attributes} 
        {...listeners} 
        style={{ 
            position: 'absolute', left: -28, top: isEditing ? 8 : 6, 
            opacity: isHovered && !isDragging ? 1 : 0, transition: 'opacity 0.2s',
            cursor: 'grab', color: 'var(--text-faint)', 
            display: 'flex', flexDirection: 'column', gap: 6,
            alignItems: 'center'
        }} 
      >
        <GripVertical size={16} />
        {isHovered && !isEditing && (
             <button onClick={(e) => { e.stopPropagation(); onDelete(note.id!); }} style={{ color: 'var(--border-color)', outline: 'none' }} className="hover:!text-[var(--text-muted)] transition-colors">
                 <Trash2 size={12} />
             </button>
        )}
      </div>

      <div style={{ cursor: 'text', padding: '2px 0' }} onClick={() => !isEditing && setIsEditing(true)}>
        {isEditing ? (
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleInput}
              onBlur={handleBlur}
              rows={1}
              placeholder="Type '/' for commands"
              className="text-body input-invisible"
              style={{ padding: '4px 0', resize: 'none', overflow: 'hidden' }}
            />
            {/* Slash Menu */}
            <AnimatePresence>
                {showCommands && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        style={{
                            position: 'absolute', top: '100%', left: 0, zIndex: 100,
                            background: '#FFF', border: '1px solid var(--border-color)', borderRadius: 8,
                            boxShadow: 'var(--shadow-lg)', padding: 4, minWidth: 200, marginTop: 4
                        }}
                    >
                        <button 
                            onClick={() => handleCommand('image')}
                            style={{ 
                                width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12, 
                                borderRadius: 4, textAlign: 'left',
                            }}
                            className="hover:bg-[var(--bg-secondary)]"
                        >
                            <ImageIcon size={16} color="var(--text-muted)" />
                            <span className="text-body" style={{ fontSize: 14 }}>Image</span>
                        </button>
                        <button 
                            onClick={() => handleCommand('sound')}
                            style={{ 
                                width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12, 
                                borderRadius: 4, textAlign: 'left',
                            }}
                            className="hover:bg-[var(--bg-secondary)]"
                        >
                            <Mic size={16} color="var(--text-muted)" />
                            <span className="text-body" style={{ fontSize: 14 }}>Record Voice</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="markdown-body" style={{ minHeight: 28, padding: '4px 0' }}>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {content || ''}
            </ReactMarkdown>
            {!content && <p style={{ color: 'var(--text-faint)', margin: 0 }}>Empty note...</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteBlock;
