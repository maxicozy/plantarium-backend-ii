import { Router } from 'express';
import data from './data.js';
import garden from './garden.js';

export default (app, db) => {

   const router = Router();
   app.use('/api', router);

   router.use('/garden', garden(db));
   router.use('/data', data(db));

}