'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  const re = new RegExp(searchTerm, 'i');
  let filter = {};
  // if(searchTerm) {
  //   filter = {$or: [{ title: re}, {content: re}]};
  // }
  if(searchTerm) {
    filter = { title: re };
  }

  if(folderId) {
    filter = {folderId: folderId};
  }

  if(tagId) {
    filter = {tags: tagId};
  }
  return Note.find(filter)
    .populate('folderId', 'name')
    .populate('tags', 'name')
    .sort({ createdAt: 'asc'})
    .then(results => {
      if(results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  return Note.findById(id)
    .then(result => {
      if(result) {
        console.log(result);
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId, tagId} = req.body;

  const newNote = {
    title: title,
    content: content,
    folderId: folderId,
    tags: tagId
  };
  
  if(!mongoose.Types.ObjectId.isValid(folderId)){
    const err = new Error('The `folder id` is not valid');
    err.status = 400;
    return next(err);
  }

  
  if(!mongoose.Types.ObjectId.isValid(tagId)){
    const err = new Error('The `tag id` is not valid');
    err.status = 400;
    return next(err);
  }
  

  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  return Note.create(newNote)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });


});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { title, content, folderId, tagId } = req.body;
 
  const updateNote = {
    title: title,
    content: content,
    folderId: folderId,
    tags: tagId
  };

  if(!mongoose.Types.ObjectId.isValid(folderId)){
    const err = new Error('The `folder id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  if(!mongoose.Types.ObjectId.isValid(tagId)){
    const err = new Error('The `tag id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!updateNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  return Note.findByIdAndUpdate(id, updateNote, {new: true})
    .then(result => {      
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  
  return Note.findByIdAndDelete(id)
    .then(result => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
  
});

module.exports = router;