const AWS = require('aws-sdk');

const client = new AWS.DynamoDB.DocumentClient({
    secretAccessKey: process.env.dynamo_private,
    accessKeyId: process.env.dynamo_key,
    region: process.env.dynamo_region
});


const put = async (table, item) => {
    return await client.put({TableName: table, Item: item}).promise()
};

const get = async (params) => {
    return await new Promise((res, rej) => {
        client.get(params, function(err, data) {
           return err ? rej(err) : res(data);
        });
    });
};

const Dynamo = {
    get,
    put,
    client
};

module.exports = Dynamo;