import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notesApi } from '../../utils/toolsApi';
import { Plus, Save, Trash2 } from 'lucide-react';

export default function NotesSyncTool() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const response = await notesApi.getAll();
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const createNew = () => {
    setCurrentNote({
      title: 'New Note',
      subject: '',
      cue_column: '',
      notes_column: '',
      summary: ''
    });
    setEditing(true);
  };

  const saveNote = async () => {
    if (!currentNote) return;
    try {
      if (currentNote.id) {
        await notesApi.update(currentNote.id, currentNote);
      } else {
        await notesApi.create({ ...currentNote, source: 'manual' });
      }
      loadNotes();
      setEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const deleteNote = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await notesApi.delete(id);
      loadNotes();
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Cornell Notes</h2>
          <p className="text-gray-600">Effective note-taking system</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={createNew}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Note
        </motion.button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Notes List */}
        <div className="col-span-1 bg-white rounded-lg border-2 border-gray-200 p-4 max-h-[600px] overflow-y-auto">
          <h3 className="font-bold mb-3">Your Notes</h3>
          {notes.length === 0 ? (
            <p className="text-gray-500 text-sm">No notes yet</p>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setCurrentNote(note);
                    setEditing(false);
                  }}
                  className={`p-3 rounded cursor-pointer transition-all ${
                    currentNote?.id === note.id
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-semibold text-sm truncate">{note.title}</div>
                  {note.subject && (
                    <div className="text-xs text-gray-500 mt-1">{note.subject}</div>
                  )}
                </div>
              ))}</div>
          )}
        </div>

        {/* Note Editor */}
        <div className="col-span-3">
          {currentNote ? (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  disabled={!editing}
                  className="text-2xl font-bold border-b-2 border-transparent focus:border-purple-500 outline-none flex-1"
                />
                <div className="flex gap-2">
                  {!editing ? (
                    <>
                      <button
                        onClick={() => setEditing(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                      >
                        Edit
                      </button>
                      {currentNote.id && (
                        <button
                          onClick={() => deleteNote(currentNote.id)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={saveNote}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
                    >
                      <Save className="w-5 h-5" />
                      Save
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                placeholder="Subject"
                value={currentNote.subject || ''}
                onChange={(e) => setCurrentNote({ ...currentNote, subject: e.target.value })}
                disabled={!editing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg mb-4 focus:border-purple-500 outline-none"
              />

              {/* Cornell Format */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-1">
                  <label className="block font-semibold mb-2 text-sm">Cues/Questions</label>
                  <textarea
                    value={currentNote.cue_column || ''}
                    onChange={(e) => setCurrentNote({ ...currentNote, cue_column: e.target.value })}
                    disabled={!editing}
                    placeholder="Key points, questions..."
                    className="w-full h-64 p-3 border-2 border-gray-200 rounded-lg resize-none focus:border-purple-500 outline-none"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block font-semibold mb-2 text-sm">Notes</label>
                  <textarea
                    value={currentNote.notes_column || ''}
                    onChange={(e) => setCurrentNote({ ...currentNote, notes_column: e.target.value })}
                    disabled={!editing}
                    placeholder="Detailed notes..."
                    className="w-full h-64 p-3 border-2 border-gray-200 rounded-lg resize-none focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-sm">Summary</label>
                <textarea
                  value={currentNote.summary || ''}
                  onChange={(e) => setCurrentNote({ ...currentNote, summary: e.target.value })}
                  disabled={!editing}
                  placeholder="Summarize the main points..."
                  className="w-full h-24 p-3 border-2 border-gray-200 rounded-lg resize-none focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
              <p className="text-lg">Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
