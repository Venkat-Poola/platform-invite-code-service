'use strict';

const HttpStatus = require('http-status-codes')
const requestPromise = require('request-promise');
const AWS = require("aws-sdk");

module.exports.handler = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'successfull',
      input: event,
    }),
  };

  callback(null, response);

};
