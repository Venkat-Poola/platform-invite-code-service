'use strict'

const env = (process.env.ENV || process.env.STAGE)

if (!env || env === '' || env === 'null' || env === 'undefined') {
    throw new Error('ENV not set, this must be set in your environment')
}

const dev = {
    ssmSecretsPath: '/platform/dev/oauth/secrets/',
    awsIotEndpoint: process.env.AWS_IOT_ENDPOINT || 'a3oty1b9t6rvzz-ats.iot.us-west-2.amazonaws.com',
    awsIotRegion: process.env.AWS_IOT_REGION || 'us-west-2',
    logLevel: process.env.LOG_LEVEL || 'debug',
    legacyRubyUrl: 'https://r-api.zodiac-dev.com',
    legacyPerlUrl: 'https://p-api.zodiac-dev.com',
    awsRegion: process.env.AWS_REGION || 'us-west-2',
    awsAccountNumber: process.env.AWS_ACCOUNT_NUMBER || '449633336138',
    awsIotPolicyPrefix: process.env.AWS_IOT_POLICY_PREFIX || 'client_policy_',
    awsUserPoolId: process.env.userPoolId || 'us-west-2_grihDcgd7',
    awsIdentityPoolId: process.env.identityPoolId || 'us-west-2:d778d28a-d6d8-4ab0-aa2a-5c3dfc6d3820',
    apiKey: process.env.apiKey || 'C4RRKQ4FR73CE4HQ',
    dyanamoDbTableName: 'device'
};

var config = {
    dev,
    test,
    prod
}

process.env.LOG_LEVEL = config[env].logLevel
config[env].env = env

module.exports = config[env]