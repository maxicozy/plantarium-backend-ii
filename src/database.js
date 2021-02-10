import dotenv from 'dotenv';
import mongo from 'mongodb';
const { MongoClient } = mongo

export default async () => {

  const config = dotenv.config(process.env.PLANTARIUM2_CONFIG).parsed

  const mongoUrl = `mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWORD}@plantarium.89hal.mongodb.net/plantarium?retryWrites=true&w=majority`;

  const client = await MongoClient.connect(mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
  
  return client.db();
}