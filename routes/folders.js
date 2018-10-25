'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Folder = require('../models/folder');

const router = express.Router();

router.get('/', (req, res, next) => {
  return Folder.find({}).sort({ name: 'asc' })
    .then(results =>{
      if(results){
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

router.get('/:id', (req, res, next)=> {
  const id = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  return Folder.findById(id)
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

router.post('/', (req, res, next) => {
  const { name } = req.body;
  
  const newFolder = {name: name};

  if(!newFolder.name){
    const err = new Error('Missing `name` field for folder');
    err.status= 400;
    return next(err);
  }

  return Folder.create(newFolder)
    .then(result =>{
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000){
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });

});

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  
  const updateFolder = {name: name};

  if(!updateFolder.name){
    const err = new Error('Missing `name` field for folder');
    err.status= 400;
    return next(err);
  }

  return Folder.findByIdAndUpdate(id, updateFolder, {new: true})
    .then(result => {
      if(result){
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000){
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  return Folder.findByIdAndDelete(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;