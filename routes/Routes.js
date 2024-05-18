const express = require("express");
const router = express.Router();
const userController = require ('../controllers/userController')
const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

// Create a new list
router.post('/', listController.createList);

// Get list details
router.get('/:listId', listController.getListDetails);

// Send email to list (Bonus Feature)
router.post('/:listId/email', listController.sendEmail);

module.exports = router;



src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Add users to a list
router.post('/:listId/users', userController.addUsers);

// Unsubscribe user from a list (Bonus Feature)
router.post('/:listId/users/:userId/unsubscribe', userController.unsubscribeUser);

module.exports = router;