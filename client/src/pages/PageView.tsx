import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNotes, addNote, updateNote, deleteNote, LocalNote, getPages, LocalPage } from '../lib/db';
import { ChevronLeft } from 'lucide-react';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import NoteBlock from '../components/NoteBlock';
import CameraCapture from '../components/CameraCapture';
import AudioCapture from '../components/AudioCapture';

const API_BASE = 'http://localhost:3000';

const PageView: React.FC = () => {
  const { id: pageIdStr } = useParams<{ id: string }>();
  const pageId = parseInt(pageIdStr || '0');
  const navigate = useNavigate();

  const [page, setPage] = useState<LocalPage | null>(null);
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [activeNote, setActiveNote] = useState<LocalNote | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadPageData = useCallback(async () => {
    if (!pageId) return;
    const allPages = await getPages();
    const currentPage = allPages.find(p => p.id === pageId);
    if (currentPage) setPage(currentPage);

    const allNotes = await getNotes(pageId);
    if (allNotes) setNotes(allNotes.sort((a, b) => a.order - b.order));
  }, [pageId]);

  useEffect(() => { loadPageData(); }, [loadPageData]);

  const handleCreateBlock = async (type: 'text' | 'image', content = '') => {
    await addNote({ pageId, type, content, order: notes.length });
    loadPageData();
  };

  const handleAudioCapture = async (base64Audio: string, audioBlob: Blob) => {
    // 1. Save locally to IndexedDB as Base64 for immediate offline playback
    await addNote({ pageId, type: 'sound', content: base64Audio, order: notes.length });
    loadPageData();
    
    // 2. Upload to server asynchronously
    try {
       const formData = new FormData();
       formData.append('audio', audioBlob, 'record.webm');
       const response = await fetch(`${API_BASE}/api/upload/audio`, {
          method: 'POST',
          body: formData
       });
       const data = await response.json();
       if (data.success && data.url) {
           // Find the note we just inserted to update its content to the streaming URL
           const currentNotes = await getNotes(pageId);
           const sorted = currentNotes.sort((a,b) => b.order - a.order);
           const target = sorted[0]; // The most recently appended block
           if (target && target.type === 'sound') {
               await updateNote(target.id!, { content: API_BASE + data.url });
               loadPageData();
           }
       }
    } catch(err) {
       console.error("Audio upload failed, keeping local base64.", err);
    }
  };

  const handleUpdateNote = async (id: number, content: string) => {
    await updateNote(id, { content });
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNote(id);
    loadPageData();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* ── Editor Canvas ── */}
      <main style={{ width: '100%', maxWidth: 'var(--max-width)', padding: '56px 24px 160px' }}>
        
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 6, 
            color: 'var(--text-muted)', marginBottom: 24, fontSize: 13, 
            textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 
          }}
          className="hover:text-black transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={2.5} style={{ marginLeft: -4 }} />
          Dashboard
        </button>

        <h1 className="text-h1" style={{ marginBottom: 40, outline: 'none' }} contentEditable={false}>{page?.title}</h1>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setActiveNote(notes.find(n => n.id === e.active.id) || null)}
          onDragEnd={async (event) => {
            setActiveNote(null);
            const { active, over } = event;
            if (over && active.id !== over.id) {
              const oldIndex = notes.findIndex(n => n.id === active.id);
              const newIndex = notes.findIndex(n => n.id === over.id);
              const newNotes = arrayMove(notes, oldIndex, newIndex);
              setNotes(newNotes);
              for (let i = 0; i < newNotes.length; i++) {
                 if (newNotes[i].order !== i) await updateNote(newNotes[i].id!, { order: i });
              }
            }
          }}
        >
          <SortableContext items={notes.map(n => n.id!)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notes.map(note => (
                <NoteBlock 
                  key={note.id} 
                  note={note} 
                  onUpdate={handleUpdateNote} 
                  onDelete={handleDeleteNote}
                  onTriggerImage={() => setShowCamera(true)}
                  onTriggerSound={() => setShowAudio(true)}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeNote ? (
              <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
                 <p className="text-body" style={{ color: 'var(--text-muted)' }}>Moving block...</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        
        {/* Placeholder Block */}
        <div 
          onClick={() => handleCreateBlock('text')}
          style={{ 
            marginTop: notes.length > 0 ? 16 : 0, 
            padding: '8px 0', 
            cursor: 'text',
          }}
        >
          <p className="text-body" style={{ color: 'var(--text-faint)' }}>Tap to type, or type '/' for commands</p>
        </div>
      </main>

      {showCamera && (
        <CameraCapture onCapture={data => handleCreateBlock('image', data)} onClose={() => setShowCamera(false)} />
      )}
      
      {showAudio && (
        <AudioCapture onCapture={handleAudioCapture} onClose={() => setShowAudio(false)} />
      )}
    </div>
  );
};

export default PageView;
