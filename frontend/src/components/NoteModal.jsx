import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { X, AlertCircle, Loader2 } from "lucide-react";

const NoteModal = ({ isOpen, onClose, note, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    setTitle(note ? note.title : "");
    setDescription(note ? note.description : "");
    setError("");
  }, [note, isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() && !description.trim()) return; // Don't save empty notes

    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in");
        setIsLoading(false);
        return;
      }

      const payload = { title, description };
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (note) {
        const { data } = await axios.put(
          `/api/notes/${note._id}`,
          payload,
          config
        );
        onSave(data);
      } else {
        const { data } = await axios.post("/api/notes", payload, config);
        onSave(data);
      }
      setTitle("");
      setDescription("");
      setError("");
      onClose();
    } catch (err) {
      console.log("Note save error");
      setError("Failed to save note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Close when clicking outside modal content
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 sm:p-6 no-theme-transition"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl shadow-[var(--shadow-elevated)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-[0.98] duration-200"
      >
        {/* Header (Top actions) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-main)]/50">
          <div className="text-xs font-medium text-[var(--text-muted)] tracking-wide uppercase">
            {note ? "Edit Note" : "New Note"}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-main)] transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 p-3 rounded-md text-sm border border-red-100 dark:border-red-900/30 mb-4">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title"
                className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-[var(--text-main)] border-none outline-none placeholder:text-[var(--text-muted)]/50 focus:ring-0 p-0"
                autoFocus
              />
            </div>

            <div className="h-full min-h-[200px]">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Start typing..."
                className="w-full h-full min-h-[200px] bg-transparent text-[var(--text-main)] text-base leading-relaxed border-none outline-none placeholder:text-[var(--text-muted)]/50 focus:ring-0 p-0 resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-[var(--border-main)]/50 flex justify-between items-center bg-[var(--bg-main)]/30">
             <span className="text-xs text-[var(--text-muted)]">
                Press Esc to close
             </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || (!title.trim() && !description.trim())}
                className="flex items-center justify-center min-w-[80px] h-9 px-4 bg-[var(--text-main)] text-[var(--bg-surface)] text-sm font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--ring-main)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
