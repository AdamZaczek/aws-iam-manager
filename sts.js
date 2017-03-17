/* eslint-disable camelcase  */

const AWS = require('aws-sdk');
const bunyan = require('bunyan');
const dynamodb = new AWS.DynamoDB();

const log = bunyan.createLogger({ name: 'sts' });

const dynamoDbQueryParams = accountName => ({
  TableName: 'aim_roles',
  Key: {
    account_name: {
      S: accountName
    },
  },
});

const assumeRole = async accountName => {
  log.info({ accountName }, 'Getting RoleARN');

  const dynamoDbItem = await dynamodb.getItem(dynamoDbQueryParams(accountName)).promise();
  const RoleArn = dynamoDbItem.Item.RoleArn.S;

  log.info({ accountName, dynamoDbItem, RoleArn }, 'Assuming role...');

  const TemporaryCredentials = new AWS.TemporaryCredentials({
    RoleArn,
  });

  AWS.config.credentials = new AWS.EnvironmentCredentials('AWS');
  AWS.config.credentials = TemporaryCredentials;

  return new AWS.IAM();
};

module.exports = {
  assumeRole,
};
