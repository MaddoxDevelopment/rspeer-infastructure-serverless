const Redis = require("../connections/redis");
const Database = require("../connections/db");
const {handle, response} = require("./util/lambda");

handle('redis', async (event, context) => {
  const alive = await Redis.isAlive();
  return response(alive ? 200 : 503, {alive})
}, module);

handle('database', async (event, context) => {
  try {
    const alive = await Database.isAlive();
    return response(200, {alive})
  } catch (e) {
    console.log(e);
    return response(503, {alive : false})
  }
}, module);