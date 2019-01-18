const Redis = require("../connections/redis");
const {handle, response} = require("./util/lambda");

handle('redis', async (event, context) => {
  const alive = await Redis.isAlive();
  return response(alive ? 200 : 503, {alive})
}, module);