 'use strict'
 
import * as shortid from "shortid";  
import {InviteCodeService} from "../../services/InviteCodeService";
import { DateTime } from "aws-sdk/clients/servicequotas"; 


module.exports.handler = (event, context, callback) => {
  try {

      const requestBody = JSON.parse(event.body);
      let deviceId = requestBody.deviceId;
      let inviteCode = shortid.generate(); 
      let expiryDate: DateTime = null;
      let userId = event.requestBody.userId;
      const inviteCodeService = new InviteCodeService();
      let result = inviteCodeService.createDynamoDbData(deviceId,inviteCode,userId,expiryDate);

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

 
