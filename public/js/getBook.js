// Function to fetch books from the server
function getBooks() {
    const request = new XMLHttpRequest();

    // Show loading indicator
    document.getElementById('loading').style.display = 'block';

    request.open('GET', 'http://localhost:5500/books', true);
    
    request.onload = function () {
        // Hide loading indicator
        document.getElementById('loading').style.display = 'none';

        if (request.status >= 200 && request.status < 300) {
            try {
                // Parse the response and store it in the global variable
                const books = JSON.parse(request.responseText);
                displayBooks(books); // Call displayBooks to render the list
            } catch (error) {
                alert('Failed to parse the book data. Please try again later.');
                console.error('JSON parsing error:', error);
            }
        } 
        else if (request.status === 404) {
            alert('No books available at the moment.');
            console.warn('No books found at the specified endpoint.');
        } 
        else {
            alert('Failed to retrieve books. Please try again later.');
            console.error('Failed to fetch books:', request.statusText);
        }
        
    };

    request.onerror = function () {
        // Hide loading indicator
        document.getElementById('loading').style.display = 'none';
        
        console.error('Network error while fetching books');
        alert('An error occurred while fetching books. Please check the console for details.');
    };

    request.send();
}


// Function to display books in the UI
function displayBooks(books) {
    const bookContainer = document.getElementById('bookContainer');

    // Check if there are books to display
    if (!books || books.length === 0) {
        bookContainer.innerHTML = '<p>No books available.</p>';
        return;
    }

    let html = '';

    // Create HTML for each book
    for (const book of books) {
        // Validate that the book object has the necessary fields
        if (book.title && book.author && book.isbn && book.genre && book.availableCopies) {
            html += `
                <div class='book-card' style='border: 1px solid #ccc; border-radius: 5px; padding: 15px; margin: 10px; text-align: center;'>
                    <img id='image' src='data:image/jpeg;base64,${book.image}' width='210' alt='${book.title}' onerror="this.onerror=null; this.outerHTML='<p>${book.title}</p>';"><br>
                    <h3 id='title' style='font-family: Helvetica; margin: 10px 0;'>${book.title}</h3>
                    <p id='author' style='font-family: Helvetica;'><strong>Author:</strong> ${book.author}</p>
                    <p id='isbn' style='font-family: Helvetica;'><strong>ISBN:</strong> ${book.isbn}</p>
                    <p id='genre' style='font-family: Helvetica;'><strong>Genre:</strong> ${book.genre}</p>
                    <p id='availableCopies' style='font-family: Helvetica;'><strong>Available Copies:</strong> ${book.availableCopies}</p>
                    <div class='button-container' style='margin-top: 10px;'>
                        <input type='button' onclick='editBook(this)' bookId='${book._id}' value='Edit' style='margin: 5px;'>
                    </div>
                </div>
            `;
        } else {
            console.warn('Incomplete book data:', book);
        }
    }

    // Update the innerHTML of the bookContainer
    bookContainer.innerHTML = html;
}
// Function to fetch a book by ID

// Call getBooks when needed, e.g., on page load or button click



// Function to search books
// Function to search books
function searchBooks() {
    const query = document.getElementById('searchInput').value.trim();

    // Create an XMLHttpRequest to fetch the search results from the backend
    const request = new XMLHttpRequest();
    document.getElementById('loading').style.display = 'block';

    request.open('GET', `http://localhost:5500/search?query=${encodeURIComponent(query)}`, true);

    request.onload = function () {
        document.getElementById('loading').style.display = 'none';

        // Directly parse and display results
        const filteredBooks = JSON.parse(request.responseText);
        displayBooks(filteredBooks);
    };

    request.onerror = function () {
        document.getElementById('loading').style.display = 'none';
        console.error('Network error while fetching search results');
    };

    request.ontimeout = function () {
        document.getElementById('loading').style.display = 'none';
        console.error('The request timed out.');
    };

    request.send();
}



function toggleClearButton() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearchBtn');
    clearButton.style.display = searchInput.value.trim() ? 'inline' : 'none';
}

// Function to clear the search input and reset the book list
function clearSearch() {
    document.getElementById('searchInput').value = '';
    toggleClearButton();
    getBooks(); // Display all books again
}