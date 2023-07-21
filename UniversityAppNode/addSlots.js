const express = require('express');
const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment');
const User = require('./models/user.js');
const Session = require('./models/session.js');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/university', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Function to create two months' worth of slots
const createSlotsForTwoMonths = async (deanId) => {
  const startDate = moment().add(3, 'days'); // Start from three days later
  const endDate = moment(startDate).add(2, 'months'); // Two months later

  const slots = [];

  // Iterate over the dates between the start and end date
  let currentDate = moment(startDate);
  while (currentDate.isSameOrBefore(endDate, 'day')) {
    // Check if the current date is Thursday or Friday
    if (currentDate.day() === 4 || currentDate.day() === 5) { // Thursday: 4, Friday: 5
      const slotDateTime = currentDate.clone().startOf('day').hour(10).format('YYYY-MM-DD HH:mm:ss');
      
      // Create a slot object
      const slot = {
        deanId,
        slotDateTime,
        duration: 60, // Duration in minutes
        status: 'pending'
      };

      slots.push(slot);
    }

    // Move to the next day
    currentDate.add(1, 'day');
  }

  // Insert the slots into the database
  try {
    await Session.insertMany(slots);
    console.log('Slots created successfully!');
  } catch (error) {
    console.error('Error creating slots:', error);
  }
};

createSlotsForTwoMonths('64b3cac71fbe8a666a4214d6'); // Replace with your own deanId value
