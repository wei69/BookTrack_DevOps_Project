describe('Add Library Book Borrowing Modal', () => {
  let baseUrl;

  // Start the server once before all tests
  before(() => {
    cy.task('startServer').then((url) => {
      baseUrl = url;
    });
  });

  // Visit the application before each test
  beforeEach(() => {
    cy.visit(baseUrl); // Ensure the app starts fresh for each test
  });

  // Stop the server after all tests
  after(() => {
    cy.task('stopServer');
  });

  // Test Case 1: Open Modal
  it('should open the modal when the open button is clicked', () => {
    cy.get('.open-library-btn', { timeout: 20000 }).should('be.visible'); // Wait for the button to be visible
    cy.get('.open-library-btn').click(); // Click the button
    cy.get('#modalOverlay').should('be.visible'); // Check if the modal is displayed
  });

  // Test Case 2: Close Modal
  it('should close the modal when the close button is clicked', () => {
    cy.get('.open-library-btn').click(); // Open the modal
    cy.get('#modalOverlay').should('be.visible'); // Ensure modal is visible
    cy.get('#closeBtn').click(); // Click the close button
    cy.get('#modalOverlay').should('not.be.visible'); // Verify modal is closed
  });

  // Test Case 3: Empty Fields Validation
  it('should show an error when required fields are empty', () => {
    cy.get('.open-library-btn').click(); // Open the modal
    cy.get('#modalOverlay').should('be.visible');
    cy.get('#submitBtn').click(); // Click submit without filling form
    cy.get('#message').should('be.visible').and('contain', 'All fields are required!');
  });

  // Test Case 4: Invalid Book ID Format
  it('should show an error when book ID format is invalid', () => {
    cy.get('.open-library-btn').click(); // Open the modal
    cy.get('#book_id').type('invalid_id'); // Invalid Book ID
    cy.get('#borrower_name').type('John Doe');
    cy.get('#borrowDate').type('2024-11-01');
    cy.get('#returnDate').type('2024-11-15');
    cy.get('#submitBtn').click(); // Try to submit
    cy.get('#message')
      .should('contain', 'Invalid book_id format. It must be a 24-character hex string.')
      .and('have.css', 'color', 'rgb(255, 0, 0)');
  });
  

  // Test Case 5: Invalid Borrower Name with Special Characters
 

  // Test Case 6: Return Date Before Borrow Date
  it('should show an error when the return date is before borrow date', () => {
    cy.get('.open-library-btn').click(); // Open the modal
    cy.get('#book_id').type('60eeb4e229d2d42d1009e46e');
    cy.get('#borrower_name').type('John Doe');
    cy.get('#borrowDate').type('2024-11-15');
    cy.get('#returnDate').type('2024-11-01');
    cy.get('#submitBtn').click(); // Try to submit
    cy.get('#message')
      .should('contain', 'Return date must be after borrow date.')
      .and('have.css', 'color', 'rgb(255, 0, 0)');
  });

  // Test Case 7: Successful Transaction Submission
  it('should successfully submit the transaction and close the modal', () => {
    cy.get('.open-library-btn').click(); // Open the modal
    cy.get('#book_id').type('60eeb4e229d2d42d1009e46e');
    cy.get('#borrower_name').type('John Doe');
    cy.get('#borrowDate').type('2024-11-01');
    cy.get('#returnDate').type('2024-11-15');

    // Mock server response for success
    cy.intercept('POST', '/addTransaction', {
      statusCode: 200,
      body: { message: 'Transaction added successfully!' },
    });

    cy.get('#submitBtn').click(); // Submit the form
    cy.get('#message')
      .should('contain', 'Transaction added successfully!')
      .and('have.css', 'color', 'rgb(0, 128, 0)'); // Green success message
    cy.get('#modalOverlay').should('not.be.visible'); // Ensure modal closes
  });

  it('should show an error if borrow date or return date is in the future', () => {
    // Open the modal
    cy.get('.open-library-btn').click(); 
    
    // Use a date in the future (for example, 1 day ahead of the current date)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Set date to tomorrow
    
    // Type in the future borrow date and return date
    cy.get('#book_id').type('60eeb4e229d2d42d1009e46e'); // Book ID
    cy.get('#borrower_name').type('Jane Doe'); // Borrower Name
    cy.get('#borrowDate').type(futureDate.toISOString().split('T')[0]); // Borrow date in the future
    cy.get('#returnDate').type(futureDate.toISOString().split('T')[0]); // Return date in the future
    
    // Submit the form
    cy.get('#submitBtn').click(); 
    
    // Assert that the error message is displayed and has the correct color (red)
    cy.get('#message')
      .should('contain', "Borrow and return dates cannot be in the future.")
      .and('have.css', 'color', 'rgb(255, 0, 0)'); // Error message in red
  });

  it('should show an error when borrower name contains special characters', () => {
    cy.get('.open-library-btn').click(); // Open the modal
    cy.get('#book_id').type('60eeb4e229d2d42d1009e46e');
    cy.get('#borrower_name').type('John!@#'); // Invalid borrower name with special characters
    cy.get('#borrowDate').type('2024-11-01');
    cy.get('#returnDate').type('2024-11-15');
    cy.get('#submitBtn').click(); // Try to submit
    cy.get('#message')
      .should('contain', "Borrower's name contains invalid characters. Only letters and spaces are allowed.")
      .and('have.css', 'color', 'rgb(255, 0, 0)'); // Red error message
  });

  it('should show an error if return date is before borrow date', () => {
    // Open the modal
    cy.get('.open-library-btn').click(); 
  
    // Set return date before borrow date
    const borrowDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(borrowDate.getDate() - 1); // Return date is one day before borrow date
  
    cy.get('#book_id').type('60eeb4e229d2d42d1009e46e');
    cy.get('#borrower_name').type('John Doe');
    cy.get('#borrowDate').type(borrowDate.toISOString().split('T')[0]);
    cy.get('#returnDate').type(returnDate.toISOString().split('T')[0]);
    
    // Submit the form
    cy.get('#submitBtn').click();
  
    // Assert that the error message is displayed
    cy.get('#message')
      .should('contain', "Return date must be after borrow date.")
      .and('have.css', 'color', 'rgb(255, 0, 0)');
  });
 

  // Test Case 8: Server Error Handling
  it('should display an error message when the server fails to add the transaction', () => {
    cy.get('.open-library-btn').click(); // Open the modal
    cy.get('#book_id').type('60eeb4e229d2d42d1009e46e');
    cy.get('#borrower_name').type('John Doe');
    cy.get('#borrowDate').type('2024-11-01');
    cy.get('#returnDate').type('2024-11-15');

    

    it('should show an error if book ID is invalid', () => {
      // Open the modal
      cy.get('.open-library-btn').click(); 
    
      // Set an invalid book ID (not a 24-character hex string)
      cy.get('#book_id').type('invalidBookId');
      cy.get('#borrower_name').type('Jane Doe');
      cy.get('#borrowDate').type('2024-11-01');
      cy.get('#returnDate').type('2024-11-15');
      
      // Submit the form
      cy.get('#submitBtn').click();
    
      // Assert that the error message is displayed
      cy.get('#message')
        .should('contain', "Invalid book_id format. It must be a 24-character hex string.")
        .and('have.css', 'color', 'rgb(255, 0, 0)');
    });


    // Mock server response for error
    cy.intercept('POST', '/addTransaction', {
      statusCode: 500,
      body: { error: 'Server error occurred.' },
    });

    cy.get('#submitBtn').click(); // Submit the form
    cy.get('#message')
      .should('contain', 'Server error occurred.')
      .and('have.css', 'color', 'rgb(255, 0, 0)');
  });

  it('should show an error when the borrower name is empty or contains only spaces', () => {
    cy.get('.open-library-btn').click(); // Open the modal
    cy.get('#book_id').type('60eeb4e229d2d42d1009e46e');
    cy.get('#borrower_name').type('   '); // Only spaces
    cy.get('#borrowDate').type('2024-11-01');
    cy.get('#returnDate').type('2024-11-15');
    cy.get('#submitBtn').click(); // Try to submit
    cy.get('#message')
      .should('contain', "Borrower's name cannot be empty or only spaces.")
      .and('have.css', 'color', 'rgb(255, 0, 0)'); // Red error message
  });

  

});
