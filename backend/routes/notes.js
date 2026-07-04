import express from "express";
import Note from "../models/Note.js"; // Always include .js for ESM
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get all notes for logged-in user
// @route   GET /api/notes
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const notes = await Note.find({ createdBy: req.user._id });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
router.post("/", protect, async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }

  try {
    const note = await Note.create({
      title,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get a single note by ID
// @route   GET /api/notes/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  const { title, description } = req.body;

  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.createdBy.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    note.title = title || note.title;
    note.description = description || note.description;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.createdBy.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
