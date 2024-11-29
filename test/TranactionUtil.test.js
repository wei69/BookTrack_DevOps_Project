const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { app, server } = require('../index'); // Replace with your app's entry point
const Book = require('../models/book');
const BorrowTransaction = require('../models/borrow-transaction');
const { MongoMemoryServer } = require('mongodb-memory-server');
const assert = require('assert');
const sinon = require('sinon'); // Add sinon for stubbing
chai.use(chaiHttp);

describe('Unit Tests backend for Book Transaction API with Stubbing and Isolated MongoDB', () => {
    let validBookId;
    let mongoServer;

    before(async function () {
        this.timeout(10000); // Increased timeout for MongoDB setup

        try {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();

            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            }

            const book = await Book.findOne();
            if (book) {
                validBookId = book._id.toString();
            } else {
                throw new Error('No book found in the database. Ensure there is at least one book for testing.');
            }

            await BorrowTransaction.deleteMany({ book_id: validBookId });

            sinon.stub(Book, 'findById').callsFake(async (id) => {
                if (id.toString() === validBookId.toString()) {
                    return { _id: validBookId, title: 'Sample Book', author: 'Sample Author' };
                }
                return null;
            });

            sinon.stub(BorrowTransaction, 'findOne').callsFake(async (query) => {
                return null;
            });

            sinon.stub(BorrowTransaction.prototype, 'save').resolves({
                book_id: validBookId,
                borrower: { name: 'John Doe' },
                borrowDate: new Date(),
                returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
        } catch (error) {
            console.log("Error during setup:", error);
        }
    });

    after(async () => {
        await mongoServer.stop();
        await new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) reject(err);
                resolve();
            });
        });
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

        assert.strictEqual(res.status, 200, 'Expected status to be 200');
        assert.strictEqual(res.body.message, 'Transaction added successfully!', 'Expected success message');
    });

    it('should return an error if the book does not exist', async () => {
        const transactionData = {
            book_id: new mongoose.Types.ObjectId().toString(),
            borrower_name: 'Jane Green',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        assert.strictEqual(res.status, 400, 'Expected status to be 400');
        assert.strictEqual(res.body.error, 'Invalid book ID', 'Expected error message for invalid book ID');
    });

    it('should return an error for an invalid book ID', async () => {
        const transactionData = {
            book_id: 'invalidBookId',
            borrower_name: 'Jane Doe',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        assert.strictEqual(res.status, 400, 'Expected status to be 400');
        assert.strictEqual(res.body.error, 'Invalid book ID', 'Expected error message for invalid book ID');
    });

    it('should return an error if the borrower name is missing', async () => {
        const transactionData = {
            book_id: validBookId,
            borrower_name: '',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        assert.strictEqual(res.status, 400, 'Expected status to be 400');
        assert.strictEqual(res.body.error, 'Borrower name is required', 'Expected error message for missing borrower name');
    });

    it('should return an error for invalid date formats', async () => {
        const transactionData = {
            book_id: validBookId,
            borrower_name: 'John Smith',
            borrowDate: 'invalidDate',
            returnDate: 'invalidDate',
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        assert.strictEqual(res.status, 400, 'Expected status to be 400');
        assert.strictEqual(res.body.error, 'Invalid date format for borrowDate or returnDate', 'Expected error for invalid date formats');
    });

    it('should return an error if the borrower name is missing', async () => {
        const transactionData = {
            book_id: validBookId,
            borrower_name: '',
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await chai.request(app).post('/addTransaction').send(transactionData);

        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'Borrower name is required');
    });
});
