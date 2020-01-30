
import * as config from "../../config"; 
import * as AWS from "aws-sdk";  
import {ClaimInviteCodeService} from "../../services/ClaimInviteCodeService";

module.exports.handler = (event: any, context: any, callback: any) => {
  try {

    const requestBody = JSON.parse(event.body);
    var deviceId = context.deviceId;
    var inviteCode = requestBody.inviteCode; 
    var rubyAuthToken = event.requestContext.authorizer.claims['custom:ruby_auth_token'];
    var rubyUserId =  event.requestContext.authorizer.claims['custom:ruby_user_id'];
    var systemName =  requestBody.name;
    var deviceType = requestBody.deviceType; 
    
    const claimInviteCodeService = new ClaimInviteCodeService();
    var dynamoData: any;
    var updateDynamo: any;
    var rubyRes = claimInviteCodeService.addDeviceToLegacy(deviceId,deviceType,rubyUserId,rubyAuthToken,systemName);

    let dynamoDb = new AWS.DynamoDB.DocumentClient({
      apiVersion: '2012-08-10',
      region: config.awsRegion
     });

     if (rubyRes) {
        dynamoData =  claimInviteCodeService.updateDUARecord(dynamoDb,deviceId,inviteCode);
     }
     
     if(dynamoData) {
        updateDynamo = claimInviteCodeService.updateDynamodbInviteCodeTable(deviceId, rubyRes,rubyUserId);
     }

     return {
      statusCode: 200,
      body: JSON.stringify({updateDynamo})
     };
  }

  catch(error) { 
    return {
      statusCode: 400,
      body: JSON.stringify({error: error.message})
    };
  }

};
 
