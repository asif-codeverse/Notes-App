import React, { useEffect, useState } from "react";
import axios from "axios";
import NoteModal from "./NoteModal";
import { useLocation } from "react-router-dom";
import { Plus, Trash2, Edit3, Clock, AlertCircle, FileText } from "lucide-react";

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in");
        return;
      }
      const searchParams = new URLSearchParams(location.search);
      const search = searchParams.get("search") || "";
      const { data } = await axios.get("/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredNotes = search
        ? data.filter(
            (note) =>
              note.title.toLowerCase().includes(search.toLowerCase()) ||
              note.description.toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setNotes(filteredNotes);
      setError("");
    } catch (err) {
      setError("Failed to fetch notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditNote(note);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchNotes();
  }, [location.search]);

  const handleSaveNote = (newNote) => {
    if (editNote) {
      setNotes(
        notes.map((note) => (note._id === newNote._id ? newNote : note))
      );
    } else {
      setNotes([...notes, newNote]);
    }
    setEditNote(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in");
        return;
      }
      await axios.delete(`/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
    } catch (err) {
      setError("Failed to delete note");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-56px)] relative">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 p-3 rounded-md mb-8 border border-red-100 dark:border-red-900/30 text-sm">
          <AlertCircle size={16} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditNote(null);
        }}
        note={editNote}
        onSave={handleSaveNote}
      />

      {/* Header Section (Title + FAB-like button for Web) */}
      {!isLoading && !error && (
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-main)]">
          <h1 className="text-2xl font-semibold text-[var(--text-main)] tracking-tight">Your Notes</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            aria-label="Create new note"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">New Note</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notes.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center mt-32 text-center px-4">
          <div className="w-16 h-16 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-center justify-center mb-6 shadow-[var(--shadow-subtle)]">
            <FileText size={28} className="text-[var(--text-muted)] stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--text-main)] mb-2">No notes yet</h3>
          <p className="text-[var(--text-muted)] max-w-sm mx-auto mb-6 text-sm">
            Create your first note to start organizing your thoughts.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors focus:outline-none"
          >
            + Create a note
          </button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && notes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-max">
          {notes.map((note) => (
            <div 
              key={note._id} 
              className="group bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg p-5 flex flex-col h-full hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-subtle)] transition-all cursor-default"
            >
              <div className="flex-1 mb-4">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="text-base font-semibold text-[var(--text-main)] line-clamp-2 leading-snug tracking-tight">
                    {note.title}
                  </h3>
                  <div className="flex space-x-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] rounded transition-colors focus:outline-none focus:opacity-100"
                      aria-label="Edit Note"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded transition-colors focus:outline-none focus:opacity-100"
                      aria-label="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-5">
                  {note.description}
                </p>
              </div>
              
              <div className="flex items-center pt-4 border-t border-[var(--border-main)]/50 mt-auto">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                  <Clock size={12} strokeWidth={2} />
                  <span>
                    {new Date(note.updatedAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;