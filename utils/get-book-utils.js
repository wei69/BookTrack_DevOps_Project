// Import the Book model to interact with the database
const Book = require('../models/book.js');
const mongoose = require('mongoose'); // Import mongoose to validate object IDs

// Define an asynchronous function to handle getting books
async function getBooks(req, res) {
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
}


// Define an asynchronous function to fetch a book by ID
async function fetchBookById(req, res) {
    const { id } = req.params; // Get the ID from the route parameters
    const sanitizedId = id.trim(); // Trim any whitespace from the ID

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(sanitizedId)) {
        return res.status(400).send('Invalid book ID format');
    }

    try {
        const book = await Book.findById(sanitizedId); // Fetch the book by ID
        if (!book) {
            return res.status(404).send('Book not found'); // If no book is found, return a 404 status
        }
        res.json(book); // Send the book as a JSON response
    } catch (error) {
        console.error('Error fetching book by ID:', error);
        res.status(500).send('Server error'); // Handle any server errors
    }
}

// Export the function to make it available for use in your routes

// Export the searchBooks function to make it available in other parts of the application
// Export the getBooks function to make it available in other parts of the application
module.exports = { getBooks,fetchBookById };
