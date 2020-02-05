
const path = require('path');
const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');


const foldersRouter = express.Router();


const serializeFolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name)
  });



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

        if (newFolder.folder_name === '' || !newFolder.folder_name)
            return res.status(400).json({
                error: { message: `Missing 'folder_name' in request body`}
            });

        FoldersService
          .insertFolder(
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



foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    FoldersService.getFolderById(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` }
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
      .then(() => {
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
          message: `Request body must contain 'folder_name'`
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