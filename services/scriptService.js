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
            `INSERT INTO public.scripts(name, accessid, description, price, type, enabled) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, 
            [name, accessId, description, price, type, false]);
        return insert.rows[0];
    },
    setEnabled : async (accessId) => {
        const update = await db.query(`UPDATE public.scripts SET enabled = TRUE WHERE accessid = $1 RETURNING *`, [accessId])
        return update.rows[0]
    }
};

module.exports = ScriptService;