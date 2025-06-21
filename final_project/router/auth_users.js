const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Middleware to verify JWT token and get username
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token missing" });

    jwt.verify(token, "fingerprint_customer", (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user.username;
        next();
    });
};

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
        return res.status(200).json({ message: "Login successful", token });
    } else {
        return res.status(401).json({ message: "Invalid username or password." });
    }
});

// Add or modify book review (protected route)
regd_users.put("/review/:isbn", verifyToken, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user;

    if (!review) {
        return res.status(400).json({ message: "Review is required in query parameters" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: `Review for ISBN ${isbn} added/modified successfully`,
        reviews: books[isbn].reviews
    });
});

// Delete book review (protected route)
regd_users.delete("/review/:isbn", verifyToken, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user;

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the review for the logged-in user
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;