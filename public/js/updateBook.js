// General function to close whichever form is open
function closeForm() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('editFormContainer').style.display = 'none';
}

// Function to open the update form with current book details
async function editBook(bookId) {
    if (!bookId) {
        alert('Invalid book ID.');
        return;
    }

    try {
        // Fetch the book details from the server using the book ID
        const response = await fetch(`http://localhost:5500/books/${bookId}`);

        if (response.ok) {
            const book = await response.json();

            // Set the form fields with current book details
            document.getElementById('editTitle').value = book.title;
            document.getElementById('editAuthor').value = book.author;
            document.getElementById('editIsbn').value = book.isbn;
            document.getElementById('editGenre').value = book.genre;
            document.getElementById('editCopies').value = book.availableCopies;
            document.getElementById('editBookId').value = book._id;
            document.getElementById('editImage').value = ''; // Reset image input

            // Set the image preview element if there's an existing image
            const imageElement = document.getElementById('editBookPreviewImage');
            if (book.image) {
                imageElement.src = `data:image/jpeg;base64,${book.image}`;
                imageElement.style.display = 'block'; // Show the image if it exists
            } else {
                imageElement.style.display = 'none'; // Hide the image if not available
            }

            // Display the form
            document.getElementById('editFormContainer').style.display = 'block';
            document.getElementById('overlay').style.display = 'block';
        } else {
            alert('Failed to fetch book details for editing.');
        }
    } catch (error) {
        console.error('Error fetching book for editing:', error);
        alert('An error occurred while fetching the book details.');
    }
}


// Function to handle update form submission
document.getElementById('editBookForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    const form = new FormData(this);
    const bookId = document.getElementById('editBookId').value;

    try {
        const response = await fetch(`http://localhost:5500/updateBook/${bookId}`, {
            method: 'PUT',
            body: form,
        });

        if (response.ok) {
            alert('Book updated successfully!');
            closeForm(); // Close the edit form
            getBooks(); // Refresh the book list
        } else {
            alert('Failed to update book. Please try again later.');
        }
    } catch (error) {
        console.error('Error updating book:', error);
        alert('An error occurred while updating the book. Please check the console for details.');
    }
});