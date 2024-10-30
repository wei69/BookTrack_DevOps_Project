function addBookFeature() {

    // Add an event listener for the 'submit' event on the form with ID 'bookForm'
    document.getElementById('bookForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission behavior to handle it with JavaScript

        // Create a new FormData object to collect form data in a structured way
        const form = new FormData();
        form.append('title', document.getElementById('title').value);
        form.append('author', document.getElementById('author').value);
        form.append('isbn', document.getElementById('isbn').value);
        form.append('genre', document.getElementById('genre').value);
        form.append('availableCopies', document.getElementById('copies').value);
        form.append('image', document.getElementById('image').files[0]);

        try {
            // Send a POST request to the server to add a new book, passing the form data as the body
            const response = await fetch('http://localhost:5500/addBook', {
                method: 'POST',
                body: form,
            });

            // Check if the server response indicates a successful request
            if (response.ok) {
                alert('Book added successfully!');
                document.getElementById('bookForm').reset();
                closeForm();
            } else {
                alert('Failed to add book.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

// Function to display the book form modal and overlay
function openForm() {
    document.getElementById('formContainer').style.display = 'block'; // Set the 'formContainer' display style to 'block' to make it visible
    document.getElementById('overlay').style.display = 'block'; // Set the 'overlay' display style to 'block' to show the overlay background
}

// Function to hide the book form modal and overlay
function closeForm() {
    document.getElementById('formContainer').style.display = 'none'; // Set the 'formContainer' display style to 'none' to hide the form
    document.getElementById('overlay').style.display = 'none'; // Set the 'overlay' display style to 'none' to hide the overlay background
}

// Initialize the addBookFeature on load
addBookFeature();
