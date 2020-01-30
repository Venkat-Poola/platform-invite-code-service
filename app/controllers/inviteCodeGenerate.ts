
import * as config from "../../config";
import shortid from "shortid"; 
import AWS from "aws-sdk";  


module.exports.handler = (event: any, context: any , callback: any ) => {
  try {

      const requestBody = JSON.parse(event.body);
      var deviceId = requestBody.deviceId;
      var inviteCode = shortid.generate(); 
      var expiryDate = null;
      var userId = event.requestBody.userId;
      var result = createDynamoDbData(deviceId,inviteCode,userId,expiryDate);

       return {
        statusCode: 200,
        body: JSON.stringify({inviteCode})
       };
  }
  catch(error) { 
      console.log("generate invite code error " +error.statusCode);
      return {
        statusCode: 400,
        body: JSON.stringify({error: error.message})
      };
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
 function createDynamoDbData(deviceId: any,inviteCode: any,userId: any,expiryDate: any) {
  return new Promise (function (resolve, reject) {
   
        const params = recordParams(deviceId,inviteCode,userId,expiryDate);
     
        var dynamoDb = new AWS.DynamoDB.DocumentClient({
            apiVersion: '2012-08-10',
            region: config.awsRegion
        });
        dynamoDb.put(params, function (error: any, data: any) {
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
 * Helper method for creating record for invite code dynamodb table
 * @param {String} deviceId the device id
 * @param {String} inviteCode  the invite code
 * @param {Integer} userId userID
 * @param (DateTime) expiryDate expiryDate
 * @returns params
 */
function recordParams(deviceId: any,inviteCode: any,userId: any,expiryDate: any) {

    const record = {
        deviceId: deviceId,
        invite_code: inviteCode,
        claimedBy: null,
        reaterdBy: userId,
        claimType: "Master",
        redeemed: false,
        createdAt: new Date().toISOString(),
        expiryDate: expiryDate,
        claimedAt: null            
    };
 
    return {
        TableName: process.env.INVITECODE_TABLE,
        Item: record
    };
}   
