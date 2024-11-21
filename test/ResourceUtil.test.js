const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index'); // Assuming your Express app is exported as `app`
const BorrowTransaction = require('../models/borrow-transaction');
const Book = require('../models/book')
const { expect } = chai;

chai.use(chaiHttp);

describe('POST /addTransaction - Add Transaction', () => {
    let validBookId;

    before(async () => {
        // Create a mock book for testing (you can also mock the database connection if needed)
        const book = await Book.create({
            title: 'Test Book',
            author: 'Test Author',
            isbn: '1234567890',
            image: 'image.jpg',
            availableCopies: 5,
            genre: 'Fiction',
        });
        validBookId = book._id.toString();
    });

    it('should successfully add a transaction', async () => {
        const transactionData = {
            book_id: validBookId,  // Use the validBookId generated above
            borrower_name: 'John Doe',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'Transaction added successfully!');

        // Verify the transaction in the database
        const savedTransaction = await BorrowTransaction.findOne({ borrower: { name: 'John Doe' } });
        expect(savedTransaction).to.exist;
        expect(savedTransaction.borrower.name).to.equal('John Doe');
        expect(savedTransaction.borrowDate).to.exist;
        expect(savedTransaction.returnDate).to.exist;
    });

    it('should return an error if the borrower name is missing', async () => {
        const transactionData = {
            book_id: validBookId,  // Use the validBookId generated above
            borrower_name: '',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Borrower name is required');
    });

    it('should return an error for invalid date formats', async () => {
        const transactionData = {
            book_id: validBookId,  // Use the validBookId generated above
            borrower_name: 'John Smith',
            borrowDate: 'invalidDate',
            returnDate: 'invalidDate',
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Invalid date format for borrowDate or returnDate');
    });

    it('should return an error if the book is already borrowed', async () => {
        const transactionData1 = {
            book_id: validBookId,  // Use the validBookId generated above
            borrower_name: 'John Doe',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        await chai.request(app).post('/addTransaction').send(transactionData1);

        const transactionData2 = {
            book_id: validBookId,  // Use the validBookId generated above
            borrower_name: 'Jane Doe',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData2);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'This book is already borrowed by another user');
    });
});
