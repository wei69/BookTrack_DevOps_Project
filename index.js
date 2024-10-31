require('dotenv').config(); // Load environment variables from .env into process.env

const express = require('express');              // Import Express to create the server
const bodyParser = require('body-parser');       // Import body-parser to parse request bodies
const multer = require('multer');                // Import multer for handling file uploads
const mongoose = require('mongoose');            // Import mongoose for MongoDB interaction
const cors = require('cors');                    // Import cors to enable Cross-Origin Resource Sharing
const Book = require('./models/Books');           // Import your Book model


// Initialize an Express application
const app = express();
const PORT = process.env.PORT || 5500; // Set server port from environment variables or default to 5500
const startPage = 'index.html';        // Define the main entry HTML file

// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());

// Configure body-parser to handle URL-encoded data and JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory (e.g., HTML, CSS, JS)
app.use(express.static('./public'));
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find(); // Fetch all books from the Book model
        
        // Check if no books are found and return a 404 status with a message
        if (books.length === 0) {
            return res.status(404).json({ message: 'No books found' });
        }

        res.status(200).json(books); // Send the books as a JSON response with 200 status
    } catch (error) {
        console.error('Error fetching books:', error);

        // Improved error response with status 500 and error message
        res.status(500).json({ message: 'Server error while fetching books', error: error.message });
    }
});

app.get('/search', async (req, res) => {
    const query = req.query.query.toLowerCase();
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Invalid parameter: "query" is required and must be a string.' });
    }
    if (query.length > 100) {
        return res.status(400).json({ error: 'Query is too long. Max length is 100 characters.' });
    }


    try {
        // Search for books that match the title
        const filteredBooks = await Book.find({
            title: { $regex: query, $options: 'i' } // Case-insensitive search
        });
        if(filteredBooks.length === 0){
            return res.status(404).json({ error: 'No books found matching your search criteria' });
        }

        // Return the filtered results
        res.json(filteredBooks);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).send('An error occurred while searching for books.');
    }
});

// Connect to MongoDB using the MONGODB_URI from the .env file
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

// Define a route to serve the main HTML page at the root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/' + startPage); // Send 'index.html' as a response
});

// Start the server on the defined PORT
const server = app.listen(PORT, function () {
    // Retrieve the server's network address information
    const address = server.address();
    // Construct the base URL, defaulting to 'localhost' if IPv6 loopback address is used
    const baseUrl = `http://${address.address === '::' ? 'localhost' : address.address}:${address.port}`;
    console.log(`BookTrack app running at: ${baseUrl}`);
});

// Export the app and server instances for use in other modules or testing
module.exports = { app, server };
