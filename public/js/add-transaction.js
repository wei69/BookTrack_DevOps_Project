function displayMessage(message, type) {
    const messageElement = document.getElementById("message");

    // Set the message text and style based on the type
    messageElement.textContent = message;
    messageElement.style.display = "block"; // Make sure the message element is visible

    if (type === "success") {
        messageElement.style.color = "green"; // Success message color
    } else if (type === "error") {
        messageElement.style.color = "red";
         // Error message color
    } 

    // Hide the message after a few seconds
   
}

function addTransaction() {
    const book_id = document.getElementById("book_id").value;
    const borrower_name = document.getElementById("borrower_name").value;
    const borrowDate = document.getElementById("borrowDate").value;
    const returnDate = document.getElementById("returnDate").value;

    // Check for empty fields
    if (!book_id || !borrower_name || !borrowDate || !returnDate) {
        displayMessage("All fields are required!", "error");
        return;
    }

    // Check for empty or whitespace-only borrower name
    if (!borrower_name.trim()) {
        displayMessage("Borrower's name cannot be empty or only spaces.", "error");
        return;
    }

    // Check for borrower name length
    

    const invalidNamePattern = /[^a-zA-Z\s]/;
    if (invalidNamePattern.test(borrower_name)) {
        displayMessage("Borrower's name contains invalid characters. Only letters and spaces are allowed.", "error");
        return;
    }

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(book_id);
    if (!isValidObjectId) {
        displayMessage("Invalid book_id format. It must be a 24-character hex string.", "error");
        return;
    }

    // Check for invalid characters in book ID
    

    const borrowDateObj = new Date(borrowDate);
    const returnDateObj = new Date(returnDate);

    // Check for valid date format
  

    // Check if the dates are in the future
    const currentDate = new Date();
    if (borrowDateObj > currentDate || returnDateObj > currentDate) {
        displayMessage("Borrow and return dates cannot be in the future.", "error");
        return;
    }

    // Check if return date is before borrow date
    if (returnDateObj <= borrowDateObj) {
        displayMessage("Return date must be after borrow date.", "error");
        return;
    }


 

    const transactionData = { book_id, borrower_name, borrowDate, returnDate };

    // Send transaction data to server
    fetch('/addTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            displayMessage(data.message, "success");
            alert("Transaction added successfully!");
            document.getElementById("transactionForm").reset(); // Reset form on success
            closeModal(); // Close modal on success only
        } else if (data.error) {
            displayMessage(data.error, "error");
        }
    })
   
}


// Function to open the modal
function openModal() {
    document.getElementById("modalOverlay").style.display = "flex";
}

// Function to close the modal
function closeModal() {
    document.getElementById("modalOverlay").style.display = "none";
}
