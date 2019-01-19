const Redis = require("../connections/redis");
const Database = require("../connections/db");
const {handle, response} = require("./util/lambda");

handle('redis', async (event, context) => {
  const alive = await Redis.isAlive();
  return response(alive ? 200 : 503, {alive})
}, module);

handle('database', async (event, context) => {
  const alive = await Database.isAlive();
  return response(alive ? 200 : 503, {alive})
}, module);

handle("check", async (event, context) => {
  const url = process.env.discord_status_webhook;
  const role = process.env.discord_role_mention;
  const axios = require('axios');
  let content = "";
  if(await Database.isAlive()) {
    content = "Database: OK";
  } else {
    content = `${role} Database: Unable to connect to postgres`;
  }
  if(await Redis.isAlive()) {
    content += ', Redis: OK.';
  } else {
    content = `, ${role} Redis: Unable to connect to redis.`;
  }
  content += ' This is only a test message, nothing to worry about.';
  axios.post(url, {'content' : content});
  return response(200, {ok : url});
}, module);