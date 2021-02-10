import dotenv from 'dotenv';
import express from 'express';
import database from './database.js';
import router from './router/main.js';

const config = dotenv.config(process.env.PLANTARIUM2_CONFIG).parsed;

const PORT = Number.parseInt(config.PORT) || 3040;

const app = express();

async function start() {

  const db = await database();
  router(app, db);

  app.listen(PORT, () => {
    console.log(`Applikation hört zu auf Hafen ${PORT}!`);
  });
}

start().catch(e => {
  console.error(e)
});