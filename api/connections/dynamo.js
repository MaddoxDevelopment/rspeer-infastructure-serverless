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

const getByAttribute = async (table, attribute, value, limit) => {
    return await new Promise((res, rej) => {
        const params = {
            TableName: table,
            FilterExpression: '#attr = :value',
            ExpressionAttributeNames: {
                '#attr': attribute,
            },
            ExpressionAttributeValues: {
                ':value': value,
            },
        };
        if(limit) {
            params.Limit = limit;
        }
        client.scan(params, function(err, data) {
           if(err) rej(err);
           res({items : data.Items, count : data.Count, scanned : data.ScannedCount})
        });
    });
};


const Dynamo = {
    get,
    getByAttribute,
    put,
    client
};

module.exports = Dynamo;