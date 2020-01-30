import * as HttpStatus from "http-status-codes";  
import * as config from "../config"
import * as AWS from "aws-sdk"; 
import * as requestPromise from "request-promise";


export class ClaimInviteCodeService {

 /**
 * addDeviceToLegacy
 * -------------------
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

public async addDeviceToLegacy(deviceId: string,deviceType: string,rubyUserId: any,rubyAuthToken: any,systemName: any) {
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
        transform: function (body: string, response: any, resolveWithFullResponse: any) {
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
   * @return  resp
*/

public async updateDUARecord(dynamoDb: AWS.DynamoDB.DocumentClient,deviceId: any,inviteCode: any) {
    try {
        let params = {
            TableName: process.env.DAA_TABLE,
            Key: {
                deviceId: deviceId
            },
            UpdateExpression: "set invite_code :inviteCode )",
            ExpressionAttributeValues: {
                ":invite_code" : [inviteCode]
            },
            ReturnValues: "UPDATED_NEW"
        };
        let resp =  await dynamoDb.update(params).promise();
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

public async updateDynamodbInviteCodeTable(deviceId: any,rubyRes: any ,rubyUserId: any) {
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
}