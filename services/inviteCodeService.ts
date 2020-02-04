
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
public async createDynamoDbData(deviceId: string,inviteCode: string,userId: string, expiryDate: DateTime) {
    return new Promise (function (resolve, reject) { 
         
         const params = {
                TableName: process.env.INVITECODE_TABLE!,
                Item: {
                    deviceId: deviceId,
                    inviteCode: inviteCode,
                    claimedBy: null,
                    createdBy: userId,
                    claimType: "Master",
                    redeemed: false,
                    createdAt: new Date().toISOString(),
                    expiryDate: expiryDate,
                    claimedAt: null
                }
          } 
         
          let dynamoDb = new AWS.DynamoDB.DocumentClient({
              apiVersion: '2012-08-10',
              region: config.awsRegion 
          });
         
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
    




















}