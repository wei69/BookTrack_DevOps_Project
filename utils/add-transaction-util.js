
const Book = require('../models/book.js');
const BorrowTransaction = require('../models/borrow-transaction.js')
async function addTransaction(req, res) {
    const { book_id, borrower_name, borrowDate, returnDate } = req.body;

    // Validate book ID
    const book = await Book.findById(book_id);
    if (!book) {
        return res.status(400).json({ error: "Invalid book ID" });
    }

    // Validate borrower name
    if (!borrower_name) {
        return res.status(400).json({ error: "Borrower name is required " });
    }

    // Validate dates
    const borrowDateObj = new Date(borrowDate);
    const returnDateObj = new Date(returnDate);

    if (isNaN(borrowDateObj.getTime()) || isNaN(returnDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid date format for borrowDate or returnDate" });
    }

    // Create new transaction
    const newTransaction = new BorrowTransaction({
        book_id: book._id, // Link to the book by its ID
        borrower: { name: borrower_name },
        borrowDate: borrowDateObj,
        returnDate: returnDateObj,
    });

    try {
        await newTransaction.save();
        res.json({ message: "Transaction added successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Error saving transaction: " + error.message });
    }
}

module.exports = { addTransaction  };