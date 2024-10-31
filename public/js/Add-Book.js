function addBookFeature() {
    document.getElementById('bookForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const isbn = document.getElementById('isbn').value.trim();
        const genre = document.getElementById('genre').value;
        const availableCopies = document.getElementById('copies').value;
        const image = document.getElementById('image').files[0];

        if (!title || !author || !isbn || !genre || !availableCopies || !image) {
            alert("All fields are required. Please fill in the required fields.");
            return;
        }

        if (!/^\d{13}$/.test(isbn)) {
            alert("ISBN must be a 13-digit number.");
            return;
        }

        const form = new FormData();
        form.append('title', title);
        form.append('author', author);
        form.append('isbn', isbn);
        form.append('genre', genre);
        form.append('availableCopies', availableCopies);
        form.append('image', image);

        try {
            const response = await fetch('http://localhost:5500/addBook', {
                method: 'POST',
                body: form,
            });

            if (response.ok) {
                alert('Book added successfully!');
                document.getElementById('bookForm').reset();
                closeForm();
            } else {
                const errorData = await response.json();
                if (errorData.error === 'title_exists') {
                    alert("The title already exists. Please use a unique title.");
                } else if (errorData.error === 'isbn_exists') {
                    alert("The ISBN already exists. Please use a unique ISBN.");
                } else if (errorData.error === 'isbn_invalid') {
                    alert("ISBN must be a 13-digit number.");
                } else {
                    alert('Failed to add book.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the book.');
        }
    });

    document.getElementById('image').addEventListener('change', function () {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = '';
        const file = this.files[0];
        if (file) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            imagePreview.appendChild(img);
        } else {
            imagePreview.innerHTML = '<span>No Image Selected</span>';
        }
    });
}

function openForm() {
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function closeForm() {
    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

addBookFeature();
