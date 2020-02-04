const FoldersService = {
    getFolder(knex) {
        return knex
        .select('*')
        .from('folders');
    },
    insertFolder(knex, newFolder) {
        return knex('folders')
            .insert(newFolder)
            .returning('*')
            .then(rows => rows[0]);
    },
    getFolderById(knex, id) {
        return knex
            .select('*')
            .from('folders')
            .where('id', id)
            .first();
    },
    updateFolder(knex, id, folderToBeUpdate) {
        return knex('folders')
            .where({id})
            .update(folderToBeUpdate);
    },
    deleteFolder(knex, id) {
        return knex('folders')
            .where({id})
            .delete();
    }
};

module.exports = FoldersService;