
 
import * as shortid from "shortid";  
import {InviteCodeService} from "../../services/InviteCodeService";
import { DateTime } from "aws-sdk/clients/servicequotas"; 
import { Item } from "aws-sdk/clients/simpledb";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { PromiseResult } from "aws-sdk/lib/request";
import * as qrcode from 'qrcode'; 
import * as fs from 'fs';
import * as qrimage from 'qr-image';
import * as app from 'express';
import * as stream from 'stream';
import * as http from 'http';
import { Transform } from 'stream';
import * as AWS from "aws-sdk"; 
 
module.exports.handler = (event, context, callback) => {
  try {

      const requestBody = JSON.parse(event.body);
      console.log("request body "+requestBody)
      let deviceId: string  = requestBody.deviceId;
      console.log("deviceid " +deviceId);
      
      const expiryDate: DateTime = null!;
      let userId: string  = requestBody.userId;
      console.log("userid " +userId);
      const inviteCodeService = new InviteCodeService(); 
     
     let inviteCode: string  = shortid.generate();  
      
     const qrOption = { 
        margin : 15,
        width : 475
      };  

      let resp
      let responseBody;
        if (deviceId.length < 18 || deviceId == undefined || deviceId == null) {
          responseBody  = {"message": "Invalid deviceId"}
          resp = {
            "isBase64Encoded": true,
            "statusCode": 400,
            headers: {
                "Access-Control-Allow-Origin" : "*",  
                "Access-Control-Allow-Credentials" : true 
            }, 
            "body": JSON.stringify(responseBody)               } 

            callback(null,resp);

          } 
        else
          {
            let res = inviteCodeService.createDynamoDbData(deviceId,inviteCode,userId,expiryDate);
                
             const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: 'us-west-2', accessKeyId: process.env.ACCESS_KEY_ID!,
             secretAccessKey: process.env.ACCESS_KEY_SECRET!});

             // Create Stream, Writable AND Readable
             const inoutStream = new Transform({
                  transform(chunk, encoding, callback) {
                  this.push(chunk);
                  callback();
                },
              });

              // Need writable stream
              qrcode.toFileStream(inoutStream, inviteCode);
              //Just to check
              inoutStream.on('finish', () => {
                 console.log('finished writing');
              });

              s3.upload(
                  {
                    Bucket: 'invitecode',
                    Key: `QR_${inviteCode}.png`,
                    Body: inoutStream,
                    ACL: 'public-read',
                    ContentType: 'image/png',
                    Expires: null!
                  },
                  (err, data) => {
                     console.log(err, data);
                    },
                  )
                  .on('httpUploadProgress', (evt) => {
                      console.log(evt);
                    })
                  .send((err, data) => {
                      console.log(err, data);
                  });
                    
                 let qrUrl = "QR_"+ inviteCode + ".png";   
                 
                 let inviteCodeUrl = "https://invitecode.s3-us-west-2.amazonaws.com/" + qrUrl;
           
         responseBody = {"qrcode": inviteCodeUrl, 
                "inviteCode":inviteCode
         }  
          
          resp = {
            "isBase64Encoded": true,
            "statusCode": 200,
            headers: {
                "Access-Control-Allow-Origin" : "*",  
                "Access-Control-Allow-Credentials" : true 
            }, 
            "body": JSON.stringify(responseBody)               } 
          } 
      
          callback(null,resp); 
  }
  catch(error) { 
      console.log("generate invite code error " +error.message);
      return {
        statusCode: 400,
        body: JSON.stringify({error: error.message})
      };
  }  
};

 
