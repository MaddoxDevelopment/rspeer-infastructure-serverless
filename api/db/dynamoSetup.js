const AWS = require('aws-sdk');

const client = new AWS.DynamoDB({
    secretAccessKey: process.env.dynamo_private,
    accessKeyId: process.env.dynamo_key,
    region: process.env.dynamo_region
});

const tables = [{
    AttributeDefinitions: [
        {
            AttributeName: 'ScriptId',
            AttributeType: 'S'
        },
        {
            AttributeName: 'Developer',
            AttributeType: 'S'
        }
    ],
    KeySchema: [
        {
            AttributeName: 'ScriptId',
            KeyType: 'HASH'
        },
        {
            AttributeName: 'Developer',
            KeyType: 'RANGE'
        }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    TableName: 'Scripts'
}, {
    AttributeDefinitions: [
        {
            AttributeName: 'UserId',
            AttributeType: 'S'
        },
        {
            AttributeName: 'ScriptId',
            AttributeType: 'S'
        }
    ],
    KeySchema: [
        {
            AttributeName: 'UserId',
            KeyType: 'HASH'
        },
        {
            AttributeName: 'ScriptId',
            KeyType: 'RANGE'
        }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    TableName: 'ScriptAccess'
}];

const createTableIfNotExist = (params) => {
    console.log("Creating Table", params.TableName);
    return new Promise((resolve, reject) => {
        client.createTable(params, function (err, data) {
            if (err && err.message.indexOf('Table already exists') !== -1) {
                console.log(params.TableName, "already exists, continuing.");
                return resolve();
            }
            if (err) {
                return reject(err);
            }
            console.log("Successfully created table", params.TableName);
            return resolve(data);
        });
    });
};

const createTables = async (name) => {
    if(name) {
        const table = tables.find(t => t.TableName === name);
        return await createTableIfNotExist(table).catch((e) => {
            console.log(e);
        })
    }
    return await Promise.all(tables.map((table) => {
        return createTableIfNotExist(table).catch((e) => {
            console.log(e);
        });
    }));
};

const DynamoSetup = {
    createTables
};

module.exports = DynamoSetup;