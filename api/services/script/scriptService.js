const db = require('./../../connections/db');
const redis = require('./../../connections/redis');
const uuidv4 = require('uuid/v4');
const assert = require('chai').assert;

const ScriptService = {
    getScript: async (id) => {
        return await redis.getAndSet(`script-${id}`, async () => {
            const rows = await db.getInstance().query('SELECT * from public.scripts WHERE id = $1 LIMIT 1', [id]);
            return rows.length === 0 ? null : rows.rows[0];
        });
    },
    insert: async ({name, description, price = 0, type, developerUserId}) => {
        const contentId = uuidv4() + "-" + uuidv4();
        const insert = await db.getInstance().query(
                `INSERT INTO public.scripts(name, contentId, description, price, type, enabled, developerUserId,
                                            dateadded)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, current_timestamp) RETURNING *`,
            [name, contentId, description, price, type, false, developerUserId]);
        return insert.rows[0];
    },
    setEnabled: async (accessId, value) => {
        const update = await db.getInstance().query(`UPDATE public.scripts
                                       SET enabled = $1
                                       WHERE accessid = $2 RETURNING *`, [value, accessId])
        return update.rows[0]
    }
};

module.exports = ScriptService;