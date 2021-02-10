import garden from './garden.js';
import { Router } from 'express';

export default (app, db) => {

   const router = Router();
   app.use('/api', router);

   router.use('/garden', garden(db));

}