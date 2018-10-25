'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');


const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const { notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API resource', function (){
  
  before(function(){
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function(){
    return Note.insertMany(notes);
  });

  afterEach(function(){
    return mongoose.connection.db.dropDatabase();
  });

  after(function(){
    return mongoose.disconnect();
  });



  describe('GET /api/notes and GET /api/notes/:id' , function(){
    it('should retrieve all notes from db', function() {
      let res;
      return chai.request(app)
        .get('/api/notes')
        .then(function(_res){
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).length.to.be.above(0);
          return Note.find();
        })
        .then(function(data) {
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a correct search results for a valid search term', function(){
      const re = new RegExp('gaga', 'i');
      let res;
      return chai.request(app)
        .get('/api/notes?searchTerm=gaga')
        .then(function(_res){
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.be.an('object');
          return Note.find({title: re});
        })
        .then(function(data) {
          expect(data).to.be.an('array');
          expect(data[0]).to.be.an('object');
          expect(data[0].title).to.match(/gaga/i);
        });


    });
    
    it('should respond with a 404 for bad path', function(){
      return chai.request(app)
        .get('/api/newpath')
        .then(function(res){
          expect(res).to.have.status(404);
        });
    });

    it('should return an array of objects where each item contains "id", "title", and "content"', function(){
      let res;
      const expectedKeys = ['id', 'title', 'content'];

      return chai.request(app)
        .get('/api/notes')
        .then(function(_res){
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          res.body.forEach(function(note){
            expect(note).to.be.a('object');
            expect(note).to.include.keys(expectedKeys);
          });
          return Note.find();
        })
        .then(function(data){
          expect(res.body).to.have.length(data.length);
        });
        
    });

    it('should return correct note when given an id', function(){
      let res;
      return chai.request(app)
        .get('/api/notes')
        .then(function(_res){
          res = _res;
          const ID = res.body[0].id;
          return chai.request(app)
            .get(`/api/notes/${ID}`)
            .then(function (response){
              expect(response).to.have.status(200);
              expect(response).to.be.an('object');
              expect(response.body).to.include({id : ID});
              return Note.findById(ID);
            })
            .then(function(data){
              expect(data).to.be.an('object');
              expect(data.id).to.equal(ID);
            });
        });
    });
  
    it('should respond with an error for an invalid id', function(){
      return chai.request(app)
        .get('/api/notes/ladhjadhaskjdhaskjdh')
        .then(function(_res){
          expect(_res).to.have.status(400);
          expect(_res.body.message).to.be.string('The `id` is not valid');
        });

    });
  });

  describe('POST /api/notes', function(){
    it('should create and return a new item when provided valid data', function(){
      const newNote = { title:'testarticle', content:'testcontent'};
      let res;
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(function(_res){
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.id).to.not.equal(null);
          return Note.findById(res.body.id);
        })
        .then(function(data){
          expect(res.body.id).to.be.equal(data.id);
          expect(res.body.title).to.be.equal(data.title);
          expect(res.body.content).to.be.equal(data.content);
        });
    });

    it('should return an error when missing `title` field', function(){
      const newNote = {content:'testcontent'};
      let res;
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(function(_res){
          res = _res;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.string('Missing `title` in request body');
          return Note.find();
        })
        .then(function(data){
          data.forEach(function(item){
            expect(item.content).to.not.include.string(newNote.content);
          });
        });
    });
  });

  describe('PUT /api/notes/:id', function(){
    it('should update the note', function(){
      const updateNote = { title: 'updatetitle', content: 'updatecontent'};
      let res;
      return chai.request(app)
        .get('/api/notes')
        .then(function(response){
          const ID = response.body[0].id;
          return chai.request(app)
            .put(`/api/notes/${ID}`)
            .send(updateNote)
            .then(function(_res){
              res = _res;
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res).to.be.an('object');
              return Note.findById(ID);
            })
            .then(function(data){
              expect(data.title).to.be.equal(res.body.title);
              expect(data.content).to.be.equal(res.body.content);
              expect(data.id).to.be.equal(res.body.id);
            });
        });  

    });

    it('should return an error when missing `title` field', function(){
      const updateNote = {content: 'updatecontent'};
      let res;
      return chai.request(app)
        .get('/api/notes')
        .then(function(response){
          const ID = response.body[0].id;
          return chai.request(app)
            .put(`/api/notes/${ID}`)
            .send(updateNote)
            .then(function(res){
              expect(res).to.have.status(400);
              expect(res.body.message).to.include.string('Missing `title` in request body');
              return Note.findById(ID);
            })
            .then(function(data){
              expect(data.content).to.not.equal(updateNote.content);
            });
        });
   
    });
  });

  describe('DELETE /api/notes/:id', function(){
    it('should delete an item by id', function(){
      let res;
      return chai.request(app)
        .get('/api/notes')
        .then(function(response){
          const ID = response.body[0].id;
          return chai.request(app)
            .delete(`/api/notes/${ID}`)
            .then(function(_res){
              res = _res;
              expect(res).to.have.status(204);
              return Note.findById(ID);
            })
            .then(function(data){
              expect(data).to.equal(null);
            });

        });

    });
  });

});