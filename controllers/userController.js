const List = require('../models/List');
const User = require('../models/User');
const csvParser = require('../services/csvParser');
const errorHandler = require('../utils/errorHandler');

exports.addUsers = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const list = await List.findById(listId).populate('properties');

    if (!list) {
      return errorHandler.handleError('List not found', 404, next);
    }

    const { users, errors } = await csvParser.parseCSV(req.file, list.properties);

    const userEmails = users.map((user) => user.email);
    const existingUsers = await User.find({ email: { $in: userEmails } });
    const existingEmails = existingUsers.map((user) => user.email);

    const usersToAdd = users.filter(
      (user) => !existingEmails.includes(user.email)
    );
    const usersNotAdded = users.filter((user) =>
      existingEmails.includes(user.email)
    );

    const newUsers = await User.insertMany(usersToAdd);
    const newUserIds = newUsers.map((user) => user._id);

    await List.updateOne(
      { _id: listId },
      { $push: { users: { $each: newUserIds } } }
    );

    const totalCount = (await List.findById(listId)).users.length;

    res.status(200).json({
      message: 'Users added successfully',
      usersAdded: usersToAdd.length,
      usersNotAdded: usersNotAdded.length,
      totalCount,
      errors,
    });
  } catch (err) {
    next(err);
  }
};

exports.unsubscribeUser = async (req, res, next) => {
  try {
    const { listId, userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { unsubscribed: true },
      { new: true }
    );

    if (!user) {
      return errorHandler.handleError('User not found', 404, next);
    }

    res.status(200).json({ message: 'User unsubscribed successfully' });
  } catch (err) {
    next(err);
  }
};



src/services/csvParser.js

const csv = require('csv-parser');
const fs = require('fs');
const errorHandler = require('../utils/errorHandler');

exports.parseCSV = async (file, properties) => {
  const users = [];
  const errors = [];

  const propertyTitles = properties.map((prop) => prop.title);

  return new Promise((resolve, reject) => {
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (data) => {
        const user = {
          name: data.name,
          email: data.email,
          properties: new Map(),
        };

        if (!user.name || !user.email) {
          errors.push({
            error: 'Missing required fields (name or email)',
            data,
          });
          return;
        }

        for (const [key, value] of Object.entries(data)) {
          if (propertyTitles.includes(key)) {
            const property = properties.find((prop) => prop.title === key);
            user.properties.set(
              key,
              value || property.defaultValue
            );
          }
        }

        users.push(user);
      })
      .on('end', () => {
        resolve({ users, errors });
      })
      .on('error', (err) => {
        reject(errorHandler.handleError('Error parsing CSV file', 500, err));
      });
  });
};