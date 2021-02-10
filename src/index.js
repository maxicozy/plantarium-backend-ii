import dotenv from 'dotenv';
import express from 'express';
import database from './database.js';
import router from './router/main.js';

dotenv.config();

const PORT = Number.parseInt(process.env.PORT) || 80;

const app = express();

async function start() {

  const db = await database();
  router(app, db);

  app.listen(PORT, () => {
    console.log(`Applikation hört zu auf Hafen ${PORT}!`);
  });
}

start().catch(e => {
  console.log(e)
  process.exit(-1)
});