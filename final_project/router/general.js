const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]);
});

// Get books by author
public_users.get('/author/:author', function (req, res) {
    const authorParam = req.params.author.toLowerCase().trim();
    const booksByAuthor = [];

    const bookKeys = Object.keys(books);
    for (let key of bookKeys) {
        if (books[key].author.toLowerCase().trim() === authorParam) {
            booksByAuthor.push(books[key]);
        }
    }

    if (booksByAuthor.length > 0) {
        return res.json(booksByAuthor);
    } else {
        return res.status(404).json({ message: `No books found for author ${req.params.author}` });
    }
});

// Get books by title
public_users.get('/title/:title', function (req, res) {
    const titleParam = req.params.title.toLowerCase().trim();
    const booksByTitle = [];

    const bookKeys = Object.keys(books);
    for (let key of bookKeys) {
        if (books[key].title.toLowerCase().trim() === titleParam) {
            booksByTitle.push(books[key]);
        }
    }

    if (booksByTitle.length > 0) {
        return res.json(booksByTitle);
    } else {
        return res.status(404).json({ message: `No books found with title ${req.params.title}` });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
    }
});

// User registration
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists." });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully." });
});

module.exports.general = public_users;