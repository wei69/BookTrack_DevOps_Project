const Book = require('../models/book.js');
const BorrowTransaction = require('../models/borrow-transaction.js');
const mongoose = require('mongoose');

async function addTransaction(req, res) {
    const { book_id, borrower_name, borrowDate, returnDate } = req.body;

    // Validate all required fields
    if (!book_id  || !borrowDate || !returnDate) {
        const errorMessage = 'please fill in all field';
        return res.status(400).json({ error: errorMessage });
    }
    
    
    try {
        // Validate book ID format
        if (!mongoose.Types.ObjectId.isValid(book_id)) {
            return res.status(400).json({ error: 'Invalid book ID' });
        }

        // Validate book existence
        const book = await Book.findById(book_id);
        if (!book) {
            return res.status(400).json({ error: 'Invalid book ID' });
        }

        // Validate dates
        const borrowDateObj = new Date(borrowDate);
        const returnDateObj = new Date(returnDate);

        if (isNaN(borrowDateObj) || isNaN(returnDateObj)) {
            return res.status(400).json({ error: 'Invalid date format for borrowDate or returnDate' });
        }

        
        if(!borrower_name){
            const errorMessage = 'Borrower name is required';
            return res.status(400).json({ error: errorMessage });
        }
    
        

        // Create and save the new transaction
        const newTransaction = new BorrowTransaction({
            book_id: book._id,
            borrower: { name: borrower_name },
            borrowDate: borrowDateObj,
            returnDate: returnDateObj,
        });

        await newTransaction.save();
        res.status(200).json({ message: 'Transaction added successfully!' });
    } catch (error) {
     
    }
}

module.exports = { addTransaction };
