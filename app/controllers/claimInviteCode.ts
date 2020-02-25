
import * as config from "../../config"; 
import * as AWS from "aws-sdk";  
import {ClaimInviteCodeService} from "../../services/ClaimInviteCodeService";

module.exports.handler = (event: any, context: any, callback: any) => {
  try {

    const requestBody = JSON.parse(event.body);
    let deviceId = context.deviceId;
    let inviteCode = requestBody.inviteCode; 
    let rubyAuthToken = event.requestContext.authorizer.claims['custom:ruby_auth_token'];
    let rubyUserId =  event.requestContext.authorizer.claims['custom:ruby_user_id'];
    let systemName =  requestBody.name;
    let deviceType = requestBody.deviceType; 
    
    const claimInviteCodeService = new ClaimInviteCodeService();
    let dynamoData;
    let updateDynamo;
    let rubyRes = claimInviteCodeService.addDeviceToLegacy(deviceId,deviceType,rubyUserId,rubyAuthToken,systemName);

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
 
