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