const Redis = require('./../../connections/redis');
const uuidv4 = require('uuid/v4');
const Dynamo = require("../../connections/dynamo");
const assert = require('chai').assert;

const ScriptService = {
    getScript: async (id) => {
        return await Redis.getAndSet(`script-${id}`, async () => {
           const result = await Dynamo.get({
               TableName : 'Scripts',
               Key : {
                   ScriptId : id
               }
           });
           return result && result.Item != null ? result.Item : null
        });
    },
    insert: async ({name, description, price = 0, type, developerUserId}) => {
        const payload = {
            id : uuidv4() + "-" + uuidv4(),
            developerId : developerUserId,
            type : type,
            price : price,
            name : name,
            description : description
        }; 
        await Dynamo.put('Scripts', payload);
        await Redis.set(`script-${payload.id}`, payload);
        await Redis.set(`script-${payload.name.toLowerCase()}`, payload.id);
    },
    setEnabled: async (accessId, value) => {
    }
};

module.exports = ScriptService;