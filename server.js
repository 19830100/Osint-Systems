const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));

// Basic routes
app.get('/api/health', (req, res) => {
    res.json({ message: 'Osint System API is running', status: 'healthy' });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Osint System server running on port ${PORT}`);
});

module.exports = app;