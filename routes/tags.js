'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Tag = require ('../models/tag');
const Note = require ('../models/note');

const router = express.Router();

router.get('/', (req, res, next) => {
  return Tag.find({}).sort({ name: 'asc' })
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

  return Tag.findById(id)
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
  
  const newTag = {name: name};

  if(!newTag.name){
    const err = new Error('Missing `name` field for tag');
    err.status= 400;
    return next(err);
  }

  return Tag.create(newTag)
    .then(result =>{
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000){
        err = new Error('The tag name already exists!');
        err.status = 400;
      }
      next(err);
    });

});

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  
  const updateTag= {name: name};

  if(!updateTag.name){
    const err = new Error('Missing `name` field for tag');
    err.status= 400;
    return next(err);
  }

  return updateTag.findByIdAndUpdate(id, updateTag, {new: true})
    .then(result => {
      if(result){
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000){
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  return Note.updateMany({tags: id}, {$pull: {tags: {$in: id} } }, {multi: true} )
    .then(() =>{
      return Tag.findByIdAndDelete(id)
        .then(() => {
          res.status(204).end();
        })
        .catch(err => {
          next(err);
        });
    });
   
});

module.exports = router;
