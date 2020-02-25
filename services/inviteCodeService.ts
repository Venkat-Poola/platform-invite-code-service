
import * as config from "../config"; 
import * as AWS from "aws-sdk";  
import { DateTime } from "aws-sdk/clients/servicequotas"; 

export class InviteCodeService {
 
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
public async createDynamoDbData(deviceId: string, inviteCode: string, userId: string,expirtDate: DateTime) {
    return new Promise (function (resolve, reject) {  
         const params = {
                TableName: process.env.INVITECODE_TABLE!,
                Item: {
                    Id: deviceId,
                    sortKey: 'ICM#',
                    deviceId: deviceId,
                    inviteCode: inviteCode,
                    claimedBy: null,
                    createdBy: userId,
                    claimType: "Master",
                    redeemed: false,
                    createdAt: new Date().toISOString(),
                    expiryDate: expirtDate,
                    claimedAt: null
                }
          }  

          const dynamoDb = new AWS.DynamoDB.DocumentClient();
          
          dynamoDb.put(params, function (error, data) {
              if (error) {
                  if (error.code === 'ConditionalCheckFailedException') {
                      console.log('record existed');
                      resolve(data);
                  } else {
                      console.error(`Failed to create invitecode Record ${error}`);
                      reject (error);
                  }
              } else {
                  console.log('Successfully put invitecode record');
                  resolve (data);
              }
            });  
   }); 
   }
   /**
     * getInviteCodeRecord
     *
     * Queries DynamoDB users that are subscribed to the device data.
     *
     * @param deviceId device id / thing name
     * @returns {Promise<*>}
    */
   async getInviteCodeRecord(deviceId) {
    const dynamoDb = new AWS.DynamoDB.DocumentClient();   
    let inviteCodeRecords = await dynamoDb.query({
        TableName: process.env.INVITECODE_TABLE!,
        KeyConditions: {
            Id: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [deviceId]
            },
            sortKey: {
                ComparisonOperator: 'BEGINS_WITH',
                AttributeValueList: ['ICM#']
            }
        }
    }).promise();
    console.log('Successfully retrieved invitecode record', deviceId); 
    return inviteCodeRecords.Items;
   }  
  } 