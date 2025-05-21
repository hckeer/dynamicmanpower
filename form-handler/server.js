const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://aayamneupane1:prisonbreak736001@cluster0.fx8cavu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Create a Message schema
const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or any email provider
    auth: {
        user: 'aayam.neupane1@gmail.com',
        pass: 'prisonbreak736001'
    }
});

// Form POST handler
app.post('/send', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // Save message to MongoDB
        const newMessage = new Message({ name, email, subject, message });
        await newMessage.save();

        // Send email
        await transporter.sendMail({
            from: email,
            to: 'aayam.neupane1@gmail.com',
            subject: `New Message: ${subject}`,
            text: `You received a new message from ${name} (${email}):\n\n${message}`
          });
          console.log('Email sent.');
          
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred.' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
