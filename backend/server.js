const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const multer = require('multer')
const fs = require('fs')
const Post = require('./models/Post')
const nodemailer = require('nodemailer')


// Create an Express app
const app = express();
const uploadFolder = path.join(__dirname, '../uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../webbr')));
app.use('../uploads', express.static(path.join(__dirname, '../uploads')));


const uploadDir = path.join(__dirname, '  uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use(express.urlencoded({ extended: true}));



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Error connecting to MongoDB:", err));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));
app.post('/api/upload', upload.single('profileImage'), async (req, res) => {
  try {
    console.log('Received upload request');

    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { title, description } = req.body;
    const photo = req.file
  ? `https://dynamicmanpower.onrender.com/uploads/${req.file.filename}`
  : null;

    

    if (!title || !description || !photo) {
      console.log('Validation failed: missing field');
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const newPost = new Post({ title, description, photo });
    await newPost.save();

    console.log('Post saved successfully');
    res.status(201).json({ message: 'Post uploaded successfully!' });

  } catch (error) {
    console.error('Error during upload:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Define this OUTSIDE your route (top-level)
const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  photo: String,
  createdAt: { type: Date, default: Date.now }
});






app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create schema and model for form submission
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
});

const loginSchema = new mongoose.Schema({
  username: String,
  password: String,
})
const Login = mongoose.model('Login', loginSchema);
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Login.findOne({ username, password });

    if (user) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const Contact = mongoose.model('Contact', contactSchema);

// POST route to handle form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  console.log("Received form submission:", req.body);

  const newContact = new Contact({ name, email, subject, message });

  try {
    await newContact.save();
    console.log("Contact saved to MongoDB");

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aayam.neupane1@gmail.com',
        pass: 'sdia oway wuxq ulrx',
      },
    });

    // Verify transporter config (debug)
    transporter.verify((error, success) => {
      if (error) {
        console.error("Transporter setup error:", error);
      } else {
        console.log("Transporter is ready to send emails");
      }
    });

    const mailOptions = {
      from: `"Dynamic Manpower" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      res.status(200).send('Message received and email notification sent!');
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr.response || emailErr.message);
      res.status(500).send('Message saved but email failed to send.');
    }

  } catch (err) {
    console.error('Error saving message:', err.message);
    res.status(500).send('Error saving message');
  }
});
    

app.get('/login', async ( req, res) => {
  res.sendFile(path.join(__dirname, '../webbr/login.html'))
}
)
app.get('/facilities', async ( req, res) => {
  res.sendFile(path.join(__dirname, '../webbr/ourfacilities.html'))
}
)





// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
