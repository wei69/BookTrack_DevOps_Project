const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { app, server } = require('../index'); // Replace with your app's entry point
const Book = require('../models/book');
const BorrowTransaction = require('../models/borrow-transaction');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { expect } = chai;

chai.use(chaiHttp);

describe('POST /addTransaction - Add Transaction', () => {
    let validBookId;
    let mongoServer;

    before(async function () {
        this.timeout(10000); // Increased timeout for MongoDB setup

        // Start an in-memory MongoDB instance
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        // Connect to in-memory MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        }

        // Ensure a valid book exists in the database
        const book = await Book.findOne();
        if (book) {
            validBookId = book._id.toString();
        } else {
            throw new Error('No book found in the database. Ensure there is at least one book for testing.');
        }

        // Clean up any active transactions for the book
        await BorrowTransaction.deleteMany({ book_id: validBookId });
    });

    after(async () => {
        // Stop in-memory MongoDB server
        await mongoServer.stop();

        // Close the server and disconnect mongoose
        await new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) reject(err);
                console.log('Server closed');
                resolve();
            });
        });

        // Disconnect mongoose
        await mongoose.disconnect();
    });

    it('should successfully add a transaction with valid data', async () => {
        const transactionData = {
            book_id: validBookId,
            borrower_name: 'John Doe',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);
        
        console.log('Response:', res.body); // Log response body for debugging

        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'Transaction added successfully!');
    });

    it('should return an error if the book does not exist', async () => {
        const transactionData = {
            book_id: new mongoose.Types.ObjectId().toString(), // Nonexistent but valid ID
            borrower_name: 'Jane Green',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Invalid book ID');
    });

    it('should return an error for an invalid book ID', async () => {
        const transactionData = {
            book_id: 'invalidBookId',
            borrower_name: 'Jane Doe',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Invalid book ID');
    });

    it('should return an error if the borrower name is missing', async () => {
        const transactionData = {
            book_id: validBookId,
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
            book_id: validBookId,
            borrower_name: 'John Smith',
            borrowDate: 'invalidDate',
            returnDate: 'invalidDate',
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Invalid date format for borrowDate or returnDate');
    });

    it('should return an error if the book is already borrowed', async () => {
        // Create an active transaction
        const activeTransaction = new BorrowTransaction({
            book_id: validBookId,
            borrower: { name: 'Existing Borrower' },
            borrowDate: new Date(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await activeTransaction.save();

        const transactionData = {
            book_id: validBookId,
            borrower_name: 'Jane Doe',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'This book is already borrowed by another user');

        // Clean up after test
        await BorrowTransaction.deleteMany({ book_id: validBookId });
    });  
});
