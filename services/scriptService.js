const db = require('./../db');
const redis = require('./../wrappers/redisWrapper');
const uuidv4 = require('uuid/v4');
const assert = require('chai').assert;

const ScriptService = {
    getScript: async (id) => {
        return await redis.getAndSet(`script-${id}`, async () => {
            const rows = await db.query('SELECT * from public.scripts WHERE id = $1 LIMIT 1', [id]);
            return rows.length === 0 ? null : rows.rows[0];
        });
    },
    insert: async ({name, accessid, description, price = 0, type}) => {
        const accessId = uuidv4() + "-" + uuidv4();
        const insert = await db.query(
            `INSERT INTO public.scripts(name, accessid, description, price, type) VALUES ($1, $2, $3, $4, $5) RETURNING *`, 
            [name, accessId, description, price, type]);
        return insert.rows[0];
    }
};

module.exports = ScriptService;