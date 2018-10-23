'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

//SEARCH FOR NOTES USING SEARCH TERM
mongoose.connect(MONGODB_URI, { useNewUrlParser: true})
  .then(() => {
    const searchTerm = 'article';
    const re = new RegExp(searchTerm, 'i');
    let filter = {};
    if(searchTerm) {
      filter = {$or: [{ title: re}, {content: re}]};
    }
    return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// //FIND NOTE BY ID
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
//   .then(() => {
//     const Id = '000000000000000000000003';

//     return Note.findById(Id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err =>{
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// //CREATE A NEW NOTE
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
//   .then(()=> {
//     const newNote = {
//       title: 'ALL THE NEW NOTES',
//       content: 'EVEN MORE NEW CONTENT FOR MY DUDES'
//     };

//     return Note.create(newNote);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// UPDATE A NOTE BY ID
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
//   .then(()=> {
//     const Id = '5bcf6f8633e12c2168626dc6';
//     const updateNote = {title: 'ALL NEW TITLES'};
//     return Note.findByIdAndUpdate(Id, updateNote);
//   })
//   .then(results =>{
//     console.log(results);
//   })
//   .then(()=> {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// // DELETE A NOTE BY ID
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(()=>{
//     const Id = '5bcf6f8633e12c2168626dc6';

//     return Note.findByIdAndRemove(Id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(()=> {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });