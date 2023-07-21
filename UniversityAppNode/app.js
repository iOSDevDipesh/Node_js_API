const express = require('express');
const mongoose = require('mongoose');
const uuid = require('uuid');

const User = require('./models/user.js');
const Session = require('./models/Session.js');
const Booking = require('./models/booking.js');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/university', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// POST request to handle login API
app.post('/login', async (req, res) => {
  const { universityId, password } = req.body;

  try {
    const user = await User.findOne({ universityId, password });
    if (user) {
      // Generate a unique token (UUID)
      const token = uuid.v4();

      // Save the token to the user document in the database
      user.token = "Bearer "+token;
      await user.save();

      res.json({ token }); // Return the token as a JSON response
    } else {
      res.status(401).json({ error: 'Invalid credentials' }); // Return an error response for invalid credentials
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' }); // Return an error response for server error
  }
});

// GET request to get getAllPendingSlots API
app.get('/getAllPendingSlots', async (req, res) => {
  
  try {
    
    const token = req.headers.authorization;

    const userData = await User.findOne({ token });

    if (!userData) {
      return res.status(403).json({ error: 'Invalid authenticatiom' });
    } else {
      const slots = await Session.find({status: 'pending' });
      res.json(slots);
    }
    
  } catch (error) {
    console.error('Error retrieving getAllPendingSlots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST request to pick a session and book it
app.post('/sessions/:sessionId/book', async (req, res) => {
  const sessionId = req.params.sessionId;
  const token = req.headers.authorization;

  try {

    // Find the user based on the token
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(403).json({ error: 'Invalid authenticatiom' });
    }
    
    // Check if the session exists and has a 'pending' status
    const session = await Session.findOne({ _id: sessionId, status: 'pending' });
    if (!session) {
      return res.status(404).json({ error: 'Session not found or unavailable' });
    }

    // Find the student based on the token
    const student = await User.findOne({ token, role: 'student' });
    if (!student) {
      return res.status(403).json({ error: 'Invalid authenticatiom' });
    }

    // Create a new booking
    const booking = new Booking({
      sessionId,
      studentId: student._id
    });

    // Save the booking to the database
    await booking.save();

    // Update the session status to 'booked'
    session.status = 'booked';
    await session.save();

    res.json({ message: 'Booking successful' });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET request to get All booked pending session with purticular dean
app.get('/bookedslots', async (req, res) => {
  const token = req.headers.authorization;

  try {
    // Find the user based on the token
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(403).json({ error: 'Invalid authenticatiom' });
    }

    let bookedSlots;

    if (user.role === 'dean') {
      // Retrieve the booked slots for the dean with status 'booked' and join with the booking table
      bookedSlots = await Session.aggregate([
        { $match: { deanId: user._id, status: 'booked' } },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'sessionId',
            as: 'bookings'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'bookings.studentId',
            foreignField: '_id',
            as: 'students'
          }
        },
        {
          $project: {
            _id: 1,
            slotDateTime: 1,
            duration: 1,
            status: 1,
            bookedStudents: '$students.name'
          }
        }
      ]);

      res.json(bookedSlots);
    }  else {
      res.json({ message: 'Invalid role' });
    }

    

  } catch (error) {
    console.error('Get booked slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});