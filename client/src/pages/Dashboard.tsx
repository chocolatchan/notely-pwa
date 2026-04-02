import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPages, addPage, deletePage, LocalPage } from '../lib/db';
import { Plus, Search, Trash2, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [pages, setPages] = useState<LocalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Custom Dialog States
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  // Focus ref for dialog
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadPages(); }, []);

  useEffect(() => {
    if (showNewNoteDialog && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNewNoteDialog]);

  const loadPages = async () => {
    const allPages = await getPages();
    setPages(allPages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setLoading(false);
  };

  const submitNewNote = async () => {
    if (newNoteTitle.trim()) {
      await addPage({ title: newNoteTitle.trim() });
      setNewNoteTitle('');
      setShowNewNoteDialog(false);
      loadPages();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submitNewNote();
    if (e.key === 'Escape') setShowNewNoteDialog(false);
  };

  const confirmDelete = async () => {
    if (noteToDelete !== null) {
      await deletePage(noteToDelete);
      setNoteToDelete(null);
      loadPages();
    }
  };

  const filteredPages = pages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      <div style={{ width: '100%', maxWidth: 'var(--max-width)', padding: '64px 24px 24px' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
           <h1 className="text-h1">Notely</h1>
           <button className="btn-primary" onClick={() => setShowNewNoteDialog(true)}>
              <Plus size={16} strokeWidth={2.5} style={{ marginRight: 6 }} />
              New
           </button>
        </header>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            className="input-invisible text-body" 
            placeholder="Search your notes..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ 
               padding: '12px 16px 12px 40px',
               backgroundColor: 'var(--bg-secondary)', 
               borderRadius: '8px', 
               transition: 'background 0.2s ease'
            }}
            onFocus={e => e.target.style.backgroundColor = '#F0F0F0'}
            onBlur={e => e.target.style.backgroundColor = 'var(--bg-secondary)'}
          />
        </div>

        {/* Note List */}
        <main>
          {filteredPages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence>
                {filteredPages.map((page) => (
                  <motion.div
                    key={page.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => navigate(`/page/${page.id}`)}
                    style={{ 
                        padding: '16px 12px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                    }}
                    className="group hover:bg-[var(--bg-secondary)] rounded-lg transition-colors border-b-transparent"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ color: 'var(--text-muted)' }}>
                            <FileText size={18} strokeWidth={2} />
                        </div>
                        <span className="text-h2" style={{ fontSize: 16 }}>{page.title}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span className="text-meta">
                            {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setNoteToDelete(page.id!); }}
                            className="btn-icon opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : !loading && (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              <p className="text-body">No notes found.</p>
            </div>
          )}
        </main>

      </div>

      {/* ── Custom Web Dialogs ── */}
      <AnimatePresence>
        {/* New Note Dialog */}
        {showNewNoteDialog && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowNewNoteDialog(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: '#FFF', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow-lg)', width: '90%', maxWidth: 400 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-h2" style={{ marginBottom: 16 }}>New Note</h2>
              <input 
                ref={inputRef}
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter note title..."
                className="input-invisible text-body"
                style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 24 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setShowNewNoteDialog(false)} style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>Cancel</button>
                <button onClick={submitNewNote} className="btn-primary">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirm Dialog */}
        {noteToDelete !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setNoteToDelete(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: '#FFF', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow-lg)', width: '90%', maxWidth: 400 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-h2" style={{ marginBottom: 8 }}>Delete Note?</h2>
              <p className="text-body" style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This action cannot be undone. Are you sure you want to delete this note permanently?</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setNoteToDelete(null)} style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>Cancel</button>
                <button onClick={confirmDelete} style={{ padding: '8px 16px', background: '#DC2626', color: '#FFF', borderRadius: 6, fontSize: 14, fontWeight: 500 }}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
