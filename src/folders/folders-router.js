// parse the orginal url path in the post method
const path = require('path');
// create express instance so we can use the router method and parse req.body data
const express = require('express');
// eliminate JS data during input and output
const xss = require('xss');
// require object service that talks to the db
const FoldersService = require('./folders-service');

// create router instance
const foldersRouter = express.Router();

// serialize data before posting them in the UI
const serializeFolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name)
  });


// 1st route
foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        FoldersService.getFolder(knexInstance)
            .then(folders => {
            res.json(folders.map(serializeFolder));
            })
            .catch(next);
        })
    .post((req, res, next) => {
        const newFolder = { folder_name: req.body.folder_name };

        if (Object.values(newFolder) === '' || !newFolder.folder_name)
            return res.status(400).json({
                error: { message: `Missing 'folder_name' in request body`}
            });

        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                .json(serializeFolder(folder));
            })
            .catch(next);
});


// 2nd route
foldersRouter
  .route('/:folder_id')
  // check to see that folder exist first, if not, return error
  .all((req, res, next) => {
    FoldersService.getFolderById(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `folder doesn't exist` }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const { folder_name } = req.body;
    const folderToUpdate = { folder_name };

    if (!folderToUpdate.folder_name || Object.values(folder_name) === '')
      return res.status(400).json({
        error: {
          message: `Request body must contain 'folder_name`
        }
      });

    FoldersService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;