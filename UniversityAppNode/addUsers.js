const express = require('express');
const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment');
const User = require('./models/user.js');
const Session = require('./models/Session.js');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/university', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const addUsers = async () => {
    try {
      // Create the dean
      const dean = new User({
        universityId: 'dean1',
        name: 'Dean 1',
        password: '1234',
        role: 'dean'
      });
      await dean.save();
  
      // Create the students
      const student1 = new User({
        universityId: 'studentA',
        name: 'Student A',
        password: '1234',
        role: 'student'
      });
      await student1.save();
  
      const student2 = new User({
        universityId: 'studentB',
        name: 'Student B',
        password: '1234',
        role: 'student'
      });
      await student2.save();
  
      console.log('Users added successfully!');
    } catch (error) {
      console.error('Error adding users:', error);
    }
  };
  
  addUsers();