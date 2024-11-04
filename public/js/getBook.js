// Function to fetch books from the server
function getBooks() {
    const request = new XMLHttpRequest();

    // Show loading indicator
    document.getElementById('loading').style.display = 'block';

    // Open a GET request to the server on the /books endpoint
    request.open('GET', 'http://localhost:5500/books', true);
    
    // Define the onload event handler for the request
    request.onload = function () {
        // Hide loading indicator
        document.getElementById('loading').style.display = 'none';

        // Check if the status code is successful (between 200 and 299)
        if (request.status >= 200 && request.status < 300) {
            try {
                // Parse the JSON response and store it in the books variable
                const books = JSON.parse(request.responseText);
                displayBooks(books); // Call displayBooks to render the list
            } catch (error) {
                // Display an alert if parsing fails
                alert('Failed to parse the book data. Please try again later.');
                console.error('JSON parsing error:', error);
            }
        } 
        // If the status is 404, alert that no books are available
        else if (request.status === 404) {
            alert('No books available at the moment.');
            console.warn('No books found at the specified endpoint.');
        } 
        // Handle other status codes by alerting the user
        else {
            alert('Failed to retrieve books. Please try again later.');
            console.error('Failed to fetch books:', request.statusText);
        }
    };

    // Define the onerror event handler for the request
    request.onerror = function () {
        // Hide loading indicator
        document.getElementById('loading').style.display = 'none';
        
        // Log a network error and alert the user
        console.error('Network error while fetching books');
        alert('An error occurred while fetching books. Please check the console for details.');
    };

    // Send the request to the server
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
<input type='button' id='editBtn' onclick='editBook("${book._id}")' value='Edit' style='margin: 5px;'>

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
function getBookById(bookId) {
    // Validate the provided book ID
    if (!bookId || typeof bookId !== 'string' || bookId.trim() === '') {
        alert('Invalid book ID. Please provide a valid ID.');
        return; // Exit function if the book ID is invalid
    }

    const request = new XMLHttpRequest();
    // Open a GET request to fetch a specific book by its ID, using template literals in the URL
    request.open('GET', `http://localhost:5500/books/${bookId}`, true);

    // Define the onload event handler for the request
    request.onload = function () {
        // Check if the request was successful (status code between 200 and 299)
        if (request.status >= 200 && request.status < 300) {
            // Parse the JSON response to get the book object
            const book = JSON.parse(request.responseText);
            displayBookDetails(book); // Call displayBookDetails to render the book details
        } 
        // If the status is 400, alert about invalid book ID format
        else if (request.status === 400) {
            alert('Invalid book ID format. Please check the ID and try again.');
            console.error('Invalid book ID format:', request.statusText);
        } 
        // If the status is 404, alert that the book was not found
        else if (request.status === 404) {
            alert('Book not found. It may have been removed.');
            console.error('Book not found:', request.statusText);
        } 
        // Handle other unsuccessful status codes by alerting the user
        else {
            alert('Failed to retrieve book details. Please try again later.');
            console.error('Failed to fetch book:', request.statusText);
        }
    };

    // Define the onerror event handler for network errors
    request.onerror = function () {
        // Log a network error and alert the user
        console.error('Network error while fetching book');
        alert('An error occurred while fetching the book. Please check the console for details.');
    };

    // Send the request to the server
    request.send();
}





// Function to search books
function searchBooks() {
    const query = document.getElementById('searchInput').value.trim();

    // Handling empty search string
    if (!query) {
        alert('Please enter a search term. Whitespace is not allowed');
        return; // Exit function if the search term is empty
    }

    // Limit query length to 100 characters
    if (query.length > 100) {
        alert('Search term is too long. Please limit to 100 characters.');
        return; // Exit function if the query exceeds 100 characters
    }
    
    // Sanitize input: Allow letters, numbers, spaces, and common punctuation marks
    const sanitizedQuery = query.replace(/[^\p{L}\p{N}\s,.!?'"-]/gu, ''); // Allows letters, numbers, and some punctuation
    if (sanitizedQuery.length !== query.length) {
        // Alert if special characters are found that are not allowed
        alert('Your search term contains special characters that are not allowed.');
        return;
    }
    if (!sanitizedQuery) {
        // Alert if the sanitized query becomes empty
        alert('Invalid search parameter. Please try again.');
        return;
    }
    

    // Create an XMLHttpRequest to fetch the search results from the backend
    const request = new XMLHttpRequest();
    document.getElementById('loading').style.display = 'block'; // Show loading indicator

    // Open a GET request with the sanitized query as a URL parameter
    request.open('GET', `http://localhost:5500/search?query=${encodeURIComponent(sanitizedQuery)}`, true);

    // Define the onload event handler for the request
    request.onload = function () {
        document.getElementById('loading').style.display = 'none'; // Hide loading indicator

        // Check if the request was successful (status code between 200 and 299)
        if (request.status >= 200 && request.status < 300) {
            // Parse the JSON response to get the filtered books array
            const filteredBooks = JSON.parse(request.responseText);
            
            // Handle no data found
            if (filteredBooks.length === 0) {
                alert('No books found matching your search criteria.');
            } else {
                // Display filtered books only if some books are found
                displayBooks(filteredBooks);
            }
        } 
        // Handle invalid search query (status 400)
        else if (request.status === 400) {
            alert('Invalid search query. Please ensure you are using the correct format and try again.');
            console.error('Invalid search query:', request.statusText);
        } 
        // Handle no books found (status 404)
        else if (request.status === 404) {
            alert('No books found matching your search criteria', request.statusText);
        } 
        // Handle other unsuccessful status codes
        else {
            console.error('Error fetching search results:', request.statusText);
            alert('Failed to retrieve search results. Please try again later.');
        }
    };

    // Define the onerror event handler for network errors
    request.onerror = function () {
        document.getElementById('loading').style.display = 'none'; // Hide loading indicator
        
        // Log network error and alert the user
        console.error('Network error while fetching search results');
        alert('An error occurred while fetching search results. Please check the console for details.');
    };
    // Define the ontimeout event handler for request timeout
    request.ontimeout = function () {
        document.getElementById('loading').style.display = 'none'; // Hide loading indicator
        
        // Alert the user about the request timeout
        alert('The request timed out. Please try again.');
    };
    // Send the request to the server
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