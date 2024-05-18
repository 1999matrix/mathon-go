const List = require('../models/Model');
const Property = require('../models/Model');
const User = require('../models/Model');
const emailService = require('../services/emailService');
const errorHandler = require('../utils/errorHandler');

exports.createList = async (req, res, next) => {
  try {
    const { title, properties } = req.body;
    const propertyIds = await Promise.all(
      properties.map(async (prop) => {
        const property = new Property({
          title: prop.title,
          defaultValue: prop.defaultValue,
        });
        return (await property.save())._id;
      })
    );

    const list = new List({
      title,
      properties: propertyIds,
    });
    await list.save();

    res.status(201).json({ message: 'List created successfully', list });
  } catch (err) {
    next(err);
  }
};

exports.getListDetails = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const list = await List.findById(listId)
      .populate('properties')
      .populate('users');

    if (!list) {
      return errorHandler.handleError('List not found', 404, next);
    }

    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

exports.sendEmail = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { subject, body } = req.body;
    const list = await List.findById(listId).populate('users');

    if (!list) {
      return errorHandler.handleError('List not found', 404, next);
    }

    const users = list.users;
    const promises = users.map((user) => {
      const userProperties = user.properties;
      let emailBody = body;

      for (const [key, value] of userProperties) {
        emailBody = emailBody.replace(`[${key}]`, value);
      }

      return emailService.sendEmail(user.email, subject, emailBody);
    });

    await Promise.all(promises);

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (err) {
    next(err);
  }
};