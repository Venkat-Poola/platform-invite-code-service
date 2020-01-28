'use strict';

const HttpStatus = require('http-status-codes')
const requestPromise = require('request-promise');
const config = require('../../config');
const request = require('request')
const fs = require('fs');
const shortid = require("shortid");
const AWS = require("aws-sdk");

module.exports.handler = (event, context, callback) => {
  try {

      const requestBody = JSON.parse(event.body);
      var deviceId = requestBody.deviceId;
      var inviteCode = shortid.generate(); 
      var expiryDate = "";
      var userId = event.requestBody.userId;
      var result = createDynamoDbData(deviceId,inviteCode,userId,expiryDate);

      callback(null, inviteCode);
  }
  catch(error) { 
      console.log("generate invite code error " +error.statusCode);
      callback(null,error);
  }  
};

/**
 * createDynamoDbData
 * ----------------------------
 * This method creates the data in DynamoDB Table - invite_code
 *
 * @param {string} deviceId the device id
 * @param {string} inviteCode the inviteCode
 * @param {integer} userId the userId
 * @param {datetime} expiryDate the expiryDate  
 *  
 */
 function createDynamoDbData(deviceId,inviteCode,userId,expiryDate) {
  return new Promise (function (resolve, reject) {
    let result = {};
    result.funct = 'createDynamoDbData';
    try {
        let params = {};
        params.TableName = process.env.INVITECODE_TABLE;
        params.Item = { 
            deviceId: deviceId,
            invite_code: inviteCode,
            claimedBy: "",
            createrdBy: userId,
            claimType: "Master",
            redeemed: false,
            createdAt: new Date().toISOString(),
            expiryDate: expiryDate,
            claimedAt: ""
        };
        var dynamoDb = new AWS.DynamoDB.DocumentClient({
            apiVersion: '2012-08-10',
            region: config.awsRegion
        });
        dynamoDb.put(params, function (error, data) {
            if (error) {
                result.statusCode = error.statusCode;
                result.message = error.message;
                result.code = error.code;
                result.error = error;
                reject (result);
            } else {
                result.statusCode = HttpStatus.OK;
                result.message = params.Item.data;
                result.code = 'OK';
                resolve (result);
            }
        });
    } catch (error) {
        result.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        result.message = error.body.message;
        result.code = 'UNKNOWN';
        result.error = error;
        reject (result);
    }
}); 
} 
