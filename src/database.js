import mongo from 'mongodb';
const { MongoClient } = mongo

export default async () => {

  const {
    DB_PASSWORD,
    DB_USERNAME
  } = process.env;

  const mongoUrl = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@plantarium.89hal.mongodb.net/plantarium?retryWrites=true&w=majority`;

  const client = await MongoClient.connect(mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
  
  return client.db();
}