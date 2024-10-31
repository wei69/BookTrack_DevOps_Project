// Import the Book model to interact with the database
const Book = require('../models/Books.js');

// Define an asynchronous function to handle adding a new book
async function addBook(req, res) {
    try {
        // Destructure the required book details from the request body
        const { title, author, isbn, genre, availableCopies } = req.body;

        // Convert the uploaded file buffer to a Base64 encoded string for the image
        const imageBase64 = req.file.buffer.toString('base64');

        // Create a new instance of the Book model with the provided data
        const newBook = new Book({
            title,
            author,
            isbn,
            genre,
            availableCopies,
            image: imageBase64,
        });

        await newBook.save(); // Save the new book instance to the database

        res.status(201).json({ message: 'Book added successfully!' });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'An error occurred while adding the book.' });
    }
}

module.exports = { addBook }; // Export the addBook function to make it available in other parts of the application
