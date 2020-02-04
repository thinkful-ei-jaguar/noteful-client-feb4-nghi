  // Instantiate service for object export
const ServiceObject = {
    // Get data
    getList(knex) {
        return knex
        .select('*')
        .from('db');
    },
    // Insert data
    insertItem(knex, item) {
        return knex('db')
            .insert(item)
            .returning('*')
            .then(rows => rows[0]);
    },
    // Get data by id
    getItem(knex, id) {
        return knex
            .select('*')
            .from('db')
            .where('id', id)
            .first();
    },
    // Update data
    updateItem(knex, id, item) {
        return knex('db')
            .where({id})
            .update(item);
    },
    // Remove data
    deleteItem(knex, id) {
        return knex('db')
            .where({id})
            .delete();
    }
};

module.exports = ServiceObject;