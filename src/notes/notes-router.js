// to parse original path
const path = require('path');
// to generate express router
const express = require('express');
// to serialize data
const xss = require('xss');
// to connect to database
const NotesService = require('./notes-service');

// creates experss router
const notesRouter = express.Router();

// ensure data posted to ui is free from js
const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    modified: note.modified,
    folder_id: note.folder_id,
    content: xss(note.content)
});

// 1st route
notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService
            .getNote(req.app.get('db'))
            .then(notes => res.json(notes))
            .catch(next);
    })
    .post((req, res, next) => {
        const { note_name, folder_id, content } = req.body;
        const newNote = { note_name, folder_id, content };

        for (const [key, value] of Object.entries(newNote)) {
            if(value == null) {
                return res.status(400).json({
                    error: {
                        message: `Missing '${key}' in request body`
                    }
                });
            }
        }
                
        NotesService
            .insertNote(
                req.app.get('db'),
                newNote
            )
            .then(note =>
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note)))
            .catch(next);
    });


// 2nd route
notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NotesService
            .getNoteById(
                req.app.get('db'),
                req.params.note_id
            )
            .then(note => {
                if(!note) {
                    return res.status(404).json({
                        error: { message: `note doesn't exist`}
                    });
                }
                res.note = note;
                next();
            })
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note));
    })
    .delete((req, res, next) => {
        NotesService
            .deleteNote(
                req.app.get('db'),
                req.params.note_id
            )
            .then(() => res.status(204).end())
            .catch(next);
    })
    .patch((req, res, next) => {
        const { note_name, folder_id, content } = req.body;
        const noteToBeUpdated = { note_name, folder_id, content };

        const numberOfValues = Object.values(noteToBeUpdated).filter(Boolean).length;
        if(numberOfValues === 0) {
          return res.status(400).json( {error: { message: `Request body must contain either 'note_name', 'folder_id', or 'content'`}});
        }
        NotesService
            .updateNote(
                req.app.get('db'),
                req.params.note_id,
                noteToBeUpdated
            )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    });


module.exports = notesRouter;