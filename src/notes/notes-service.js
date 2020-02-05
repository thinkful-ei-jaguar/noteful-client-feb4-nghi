// Creates service object to retrieve data from data bases
const NotesService = {
    getNote(knex) {
        return knex('notes')
            .select('*');
    },
    insertNote(knex, newNote) {
        return knex('notes')
            .insert(newNote)
            .returning('*')
            .then(rows => rows[0]);
    },
    getNoteById(knex, id) {
        return knex('notes')
            .select('*')
            .where({ id })
            .first();
    },
    updateNote(knex, id, noteToBeUpdate) {
        return knex('notes')
            .where({ id })
            .update(noteToBeUpdate);
    },
    deleteNote(knex, id) {
        return knex('notes')
            .where({ id })
            .delete();
    }
};

module.exports = NotesService; 

