function makeNotesArray() {
    return [{
        id: 1,
        note_name: 'note test 1',
        modified: '2029-01-22T16:28:32.615Z',
        folder_id: 1,
        content: 'content test 1'
    },
    {
        id: 2,
        note_name: 'note test 2',
        modified: '2019-01-22T16:28:32.615Z',
        folder_id: 2,
        content: 'content test 2'
    },
    {
        id: 3,
        note_name: 'note test 3',
        modified: '2012-01-22T16:28:32.615Z',
        folder_id: 3,
        content: 'content test 3'
    },
    {
        id: 4,
        note_name: 'note test 4',
        modified: '2019-11-22T16:28:32.615Z',
        folder_id: 4,
        content: 'content test 4'
    }
];
}

module.exports = { makeNotesArray };