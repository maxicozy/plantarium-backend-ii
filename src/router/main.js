import { Router } from 'express';
import garden from './garden.js';

export default (app, db) => {

   const router = Router();
   app.use('/api', router);

   //leitet weiter an alle daten die mit dem system zusammenhängen
   router.use('/garden', garden(db));

}