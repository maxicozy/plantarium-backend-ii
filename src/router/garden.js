import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';

export default db => {

  const router = Router()

  //vereinfacht das zusammenführen der relational abgespeicherten daten
  const moduleLookup = {
    $lookup: {
      from: "modules",
      localField: "_id",
      foreignField: "garden",
      as: "modules",
    }
  };

  //holt alle gärten aus der datenbank und fügt jeweils die zugehörigen module mit aggregate ein
  router.get('/', async (req, res) => {

    const gardens = await db.collection('gardens')
      .aggregate([moduleLookup]).toArray();

      if (gardens) res.json(gardens);
      else res.status(404).send();

  });

  //holt einen garten mit dem angegebenen namen aus der datenbank und fügt die zugehörigen module ein
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

      //module werden mit den daten aus templateData gepromised
      const modules = await Promise.all(garden.modules.map(async m => {
        if(!m) return null;

        //module werden mit den entsprechenen phasen und growTime aus templateData bestückt
        const template = await db.collection('templateData').findOne({
          plant: m.plant
        })
        
        //wenn keine daten gefunden werden wird nichts bestückt
        if(!template) return m;

        //mit den daten aus templateData werden die übrigen tage und der wachstumsprozentsatz berechnet
        const plantedFor = (new Date().getTime() - m.plantedOn.getTime()) / 1000 / 3600 / 24;
        const percentGrown = plantedFor / template.growTime;
        const inDays = template.growTime - plantedFor;
 
        //hier wird bestimmt was im frontend angezeigt wird je nachdem wie viel tage noch bleiben bis zum fertigwachsen der pflanze
        const harvestString = () => {
          if(inDays <= 0) return 'now';
          else if(inDays <= 3) return 'soon';
          else return `in ${Math.round(inDays)} days`;
        }

        const harvestIn = harvestString();

        //zusätzliche daten werden an das modul angehängt
        return {...m, phases: template.phases, percentGrown, harvestIn };
        
      }))

    if (garden) res.json({ ...garden, modules });
    else res.status(404).send();

  });

  //holt die sensordaten eines bestimmten moduls aus einem garten mit dem angegebenen namen aus der datenbank
  router.get('/:name/:position/sensordata', celebrate({
    params: {
      name: Joi.string().required(),
      position: Joi.number().required(),
    },
    //hier kann das frontend angeben in welchem zeitraum sich die sensordaten befinden sollen
    query: {
      to: Joi.date().max('now'),
      from: Joi.date().max('now'),
    }
  }), async (req, res) => {

  //id des abgefragten moduls im zugehörigen garten der sensordaten werden bestimmt
  const garden = await db.collection('gardens').findOne({
      name: new RegExp(`^${req.params.name}$`, 'i')
    });

    if(!garden) return res.status(404).send();

    const mod = await db.collection('modules').findOne({
      position: Number.parseInt(req.params.position),
      garden: garden._id,
    });
    
    if(!mod) return res.status(404).send();

    //hier werden default werte für die query der sensordaten bestimmt, in diesem fall die daten der letzten 4 wochen
    const now = new Date().getTime();
    const from = req.query.from ? req.query.from : new Date(now - (1000 * 3600 * 24 * 7 * 4));
    const to = req.query.to ? req.query.from : new Date(now)

    //jetzt werden alle sensordaten des abgefragten moduls abgeholt, welche im angefragten zeitraum aufgenommen wurden
    const sensordata = await db.collection('sensordatas')
      .find({
          module: mod._id,
          time: {
            $gte: from,
            $lt: to,
          }
      }).toArray();

    if (sensordata) res.json(sensordata);
    else res.status(404).send();

  });
  return router;

}