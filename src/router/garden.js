import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';

export default db => {

  const router = Router()

  const moduleLookup = {
    $lookup: {
      from: "modules",
      localField: "_id",
      foreignField: "garden",
      as: "modules",
    }
  }

  router.get('/', async (req, res) => {

    const gardens = await db.collection('gardens')
      .aggregate([moduleLookup]).toArray();

      if (gardens) res.json(gardens);
      else res.status(404).send();
  });

  router.get('/:name', celebrate({
    params: {
      name: Joi.string().required()
    }
  }), async (req, res) => {

    const [garden] = await db.collection('gardens')
      .aggregate([moduleLookup, {
        $match: {
          name: new RegExp(`^${req.params.name}$`, 'i')
        }
      }]).toArray();

    if (garden) res.json(garden);
    else res.status(404).send();

  });

  router.get('/:name/:position/sensordata', celebrate({
    params: {
      name: Joi.string().required(),
      position: Joi.number().required(),
     },
    query: {
      to: Joi.date().max('now'),
      from: Joi.date().max('now'),
    }
  }), async (req, res) => {

   const garden = await db.collection('gardens').findOne({ 
      name: new RegExp(`^${req.params.name}$`, 'i')
    });

    if(!garden) return res.status(404).send();

    const mod = await db.collection('modules').findOne({
      position: Number.parseInt(req.params.position),
      garden: garden._id,
    });
    
    if(!mod) return res.status(404).send();

    const now = new Date().getTime();
    const from = req.query.from ?? new Date(now - (1000 * 3600 * 24 * 7 * 4));
    const to = req.query.to ?? new Date(now)

    console.log(from, to)

    const sensordata = await db.collection('sensordatas').find({
      module: mod._id,
      time: {
         $gte: from,
         $lt: to,
      },
    }).toArray();

    if (sensordata) res.json(sensordata);
    else res.status(404).send();

  });
  return router;

}