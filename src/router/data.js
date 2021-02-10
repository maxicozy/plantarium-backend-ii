import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';

export default db => {

  const router = Router()

  router.get('/', async (req, res) => {
    const templateData = await db.collection('templateData').find().toArray();

    if (templateData) res.json(templateData);
    else res.status(404).send();
  });

  router.get('/:plant', celebrate({
    params: {
      plant: Joi.string().required()
    }
  }), async (req, res) => {
    const [plantTemplate] = await db.collection('templateData').find({
      plant: new RegExp(`^${req.params.plant}$`, 'i')
    }).toArray();

    if (plantTemplate) res.json(plantTemplate);
    else res.status(404).send();
  });

  return router;

}