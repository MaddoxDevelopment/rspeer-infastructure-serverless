const Redis = require('./../../connections/redis');
const uuidv4 = require('uuid/v4');
const Dynamo = require("../../connections/dynamo");
const assert = require('chai').assert;
const table = "Scripts";

const ScriptService = {
    getScriptsByDeveloper : async (userId) => {
        const ids = await Redis.getAndSet(`scripts-developer-${userId}`, async () => {
            const results = await Dynamo.getByAttribute(table, "developerId", userId);
            return results.items.map(i => i.id);
        });
        return await Promise.all(ids.map(i => ScriptService.getScript(i)));
    },
    getScript: async (id) => {
        return await Redis.getAndSet(`script-${id}`, async () => {
           const result = await Dynamo.get({
               TableName : table,
               Key : {
                   id : id
               }
           });
           return result && result.Item != null ? result.Item : null
        });
    },
    getScriptByName : async (name) => {
        name = name.toLowerCase().trim();
        const key = `script-${name}`;
        const id = await Redis.get(key);
        if(!id) {
            const results = await Dynamo.getByAttribute(table, 'nameLower', name, 1);
            if(results.items.length === 0) {
                return null;
            }
            const script = results.items[0];
            await Redis.set(`script-${id}`, script);
            await Redis.set(key, script.id);
            return script;
        }
        return await ScriptService.getScript(id);
    },
    insert: async ({name, description, price = 0, type, developerUserId}) => {
        const payload = {
            id : uuidv4() + "-" + uuidv4(),
            accessId : uuidv4() + "-" + uuidv4(),
            developerId : developerUserId,
            type : type,
            price : price,
            name : name,
            nameLower : name.toLowerCase().trim(),
            description : description,
            enabled : true
        }; 
        await Dynamo.put(table, payload);
        await Redis.set(`script-${payload.id}`, payload);
        await Redis.set(`script-${payload.name.toLowerCase()}`, payload.id);
        await Redis.remove(`scripts-developer-${payload.developerId}`)
    }
};

module.exports = ScriptService;