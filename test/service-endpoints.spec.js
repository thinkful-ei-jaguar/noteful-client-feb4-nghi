const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray } = require('./folders.fixtures');
const { makeNotesArray } = require('./notes.fixtures');

describe('Folders Endpoints', function() {
  let db;

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);

  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

  describe(`GET /api/folders`, () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      });
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders);
      });

      it('responds with 200 and all of the folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      });
    });

    context(`Given an XSS attack folder`, () => {
      const maliciousFolder = {
          folder_name: 'Fake folder <img src="http://url.com" onerror="alert(document.cookie);">'
      }
      const expectedFolder = {
          folder_name: 'Fake folder <img src="http://url.com">'
      };

      beforeEach('insert malicious folder', () => {
        return db
          .into('folders')
          .insert([maliciousFolder]);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/folders`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].folder_name).to.eql(expectedFolder.folder_name);
          });
      });
    });
  });

  describe(`GET /api/folders/:folder_id`, () => {
    context(`Given no folder`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456;
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } });
      });
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      });

      it('responds with 200 and the specified folder', () => {
        const folderId = 2
        const expectedFolder = testFolders[folderId - 1]
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(200, expectedFolder)
      })
    });

    context(`Given an XSS attack folders`, () => {
      const testFolders = makeFoldersArray();
      const maliciousFolder = { 
        id: 5,
        folder_name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">`
      };
      const expectedFolder = {
          folder_name: `Bad image <img src="https://url.to.file.which/does-not.exist">`
      };

      beforeEach('insert malicious folder', () => {
        return db
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('folders')
              .insert([ maliciousFolder]);
          });
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/folders/${maliciousFolder.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.folder_name).to.eql(expectedFolder.folder_name);
          });
      });
    });
  });

  describe(`POST /api/folders`, () => {
    const testFolders = makeFoldersArray();

    beforeEach('insert malicious folder', () => {
      return db
        .into('folders')
        .insert(testFolders);
    });

    it(`creates a folder, responding with 201 and the new folder`, () => {
      const newFolder = {
        folder_name: 'Test new Folder'
      };
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(newFolder.folder_name);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body)
        );
    });

    it(`responds with 400 and an error message when the 'folder_name' is missing`, () => {
    const newFolder = {
        randomVar: 'la'
      };
    return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(400, {
        error: { message: `Missing 'folder_name' in request body` }
        });
    });
  });

  describe(`DELETE /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .delete(`/api/Folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } });
      });
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders);
      });

      it('responds with 204 and removes the folders', () => {
        const idToRemove = 2
        const expectedFolders = testFolders.filter(f => f.id !== idToRemove)
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders`)
              .expect(expectedFolders)
          );
      });
    });
  });

  describe(`PATCH /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders);
      });

      it('responds with 204 and updates the folders', () => {
        const idToUpdate = 2;
        const updateFolder = {
          folder_name: 'updated folders title',
        };
        const expectedFolder = {
          ...testFolders[idToUpdate - 1],
          ...updateFolder
        };
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send(updateFolder)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .expect(expectedFolder)
          );
      });

      it(`responds with 400 when no required field supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain 'folder_name'`
            }
          });
      });

     
    });
  });
});

