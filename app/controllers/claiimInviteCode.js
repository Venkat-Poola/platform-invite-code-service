'use strict';

const HttpStatus = require('http-status-codes');
const requestPromise = require('request-promise');
const config = require('../../config');
const AWS = require("aws-sdk");

module.exports.handler = (event, context, callback) => {

  try {

    const requestBody = JSON.parse(event.body);
    var deviceId = context.deviceId;
    var inviteCode = requestBody.inviteCode; 
    var rubyAuthToken = event.requestContext.authorizer.claims['custom:ruby_auth_token'];
    var rubyUserId =  event.requestContext.authorizer.claims['custom:ruby_user_id'];
    var systemName =  requestBody.name;
    var deviceType = requestBody.deviceType; 

    var rubyRes = await addDeviceToLegacy(deviceId,deviceType,rubyUserId,rubyAuthToken,systemName);

    let dynamoDb = new AWS.DynamoDB.DocumentClient({
      apiVersion: '2012-08-10',
      region: config.awsRegion
     });

     if (rubyRes.statuscode == 200) {
        var dynamoData = await updateDUARecord(dynamoDb,deviceId,rubyUserId,rubyRes,inviteCode);
     }
     
     if(dynamoData.statuscode == 200) {
       var updateDynamo = await updateDynamodbInviteCodeTable(deviceId,rubyRes,rubyUserId);
     }

     callback(null, updateDynamo);
  }

  catch(error) {
    callback(null,error)
  }

};

/**
 * findDeviceIdInLegacy
 * -----------------
 * - This method will send the device class to the ruby api endpoint
 *    
 * 
 * @param {string} rubyUserId the Ruby user id
 * @param {string} rubyAuthToken the Ruby Authorization token
 * @param {string} deviceId sent in the path of the request
 * @param {string} deviceType sent in the body of the request type of device
 * @param {string} systemName sent in the body of the request named by the user, not sure if used
 * @return the result of the Ruby call
 */

function addDeviceToLegacy(deviceId,deviceType,rubyUserId,rubyAuthToken,systemName) {
  var body = {
      api_key: config.apiKey,
      device_type: deviceType,
      name: systemName || '',
      user_id: rubyUserId,
      authentication_token: rubyAuthToken
  };
  var options = {
      uri: config.legacyRubyUrl + '/devices/' + deviceId + '/add.json',
      method: 'POST',
      form: body,
      headers: {
          'content-type': 'application/x-www-form-urlencoded'
      },
      transform: function (body, response, resolveWithFullResponse) {
          return JSON.parse(body)
      }
  };
  return requestPromise(options);
}

 /**
 * updateDUARecord
 * ----------------------------
 * update DUA record (user to device association)
 *
 * @param {Object} dynamoDb Client for interacting with DynamoDB
 * @param {String} deviceId the device id
 * @param {String} inviteCode the invite code 
 * @return null
 */ 
function updateDUARecord(dynamoDb,deviceId,inviteCode) {
  try {
      let params = {
          TableName: process.env.DAA_TABLE,
          Key: {
              deviceId: deviceId
          },
          UpdateExpression: "set invite_code :inviteCode )",
          ExpressionAttributeValues: {
              "invite_code" : [inviteCode]
          },
          ReturnValues: "UPDATED_NEW"
      };
      let resp = await dynamoDb.update(params).promise();
      console.log(`updated DUA record`);
      return resp;
  } catch (error) {
      console.error(`Error updating device to connection record.', ${error}`);
      throw error;
  }
};


 /**
 * updateDynamodbInviteCodeTable
 * ----------------------------
 * update the invite_code dynamoDb table
 *
 *  @param {String} deviceId the device id
 * @param {Object} rubyRes object 
 * @param {integer} rubyUserId rubyUserId
 * @return null
 */ 
function updateDynamodbInviteCodeTable(deviceId,rubyRes,rubyUserId) {
  try {
    var claimedDt = new Date().toISOString();
    var redeemed = true;
    var claimedBy = rubyRes.owner_id || rubyUserId;

    let params = {
        TableName: process.env.INVITECODE_TABLE,
        Key: {
            deviceId: deviceId
        },
        UpdateExpression: "set redeemed :redeemed , claimedAt:claimedDt, claimedBy:claimedBy )",
        ExpressionAttributeValues: {
            ":redeemed" : [redeemed],
            ":claimedAt": [claimedDt],
            ":claimedBy": [claimedBy]
        },
        ReturnValues: "UPDATED_NEW"
    };

    let dynamoDb = new AWS.DynamoDB.DocumentClient({
      apiVersion: '2012-08-10',
      region: config.awsRegion
     });

    let resp = await dynamoDb.update(params).promise();
    console.log(`updated inviteCode record`);
    return resp;
  }  
  
  catch (error) {
    console.error(`Error updating device to connection record.', ${error}`);
    throw error;
  }
} 
