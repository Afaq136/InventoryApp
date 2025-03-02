require("dotenv").config({ path: ".env.local" });

const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URI;
const dbName = "INVO"; 

async function findItems() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db(dbName);
    const quransCollection = db.collection("Qurans");
    const literatureCollection = db.collection("Literature");


    const quransData = await quransCollection.find({}).toArray();
    const literatureData = await literatureCollection.find({}).toArray();

    const formattedResult = [
      {
        title: 'Qurans',
        data: quransData
      },
      {
        title: 'Literature',
        data: literatureData
      }
    ];

    return formattedResult;
  } catch (err) {
    console.error("Error finding document:", err);
    return []; // Return an empty array in case of an error
  } finally {
    await client.close();
  }
}


export async function GET(request: Request) {
  
  try {
    const result = await findItems();

    // If no items are found, return an empty array
    return Response.json(result.length > 0 ? result : []);
  } catch (error) {
    console.error("Error fetching items:", error);
    
    // Return an empty array in case of an error
    return Response.json([]);
  }

}