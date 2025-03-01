require("dotenv").config({ path: ".env.local" });

const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URI;
const dbName = "INVO"; // Replace with your actual database name
const collectionName = "Qurans"; // Replace with your actual collection name

async function findItems() {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Define your query (e.g., find all documents)
    const query = {}; // Replace with your actual search criteria

    const result = await collection.find(query).toArray();

    return result; // Return the array instead of logging it
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

    console.log(result);
    // If no items are found, return an empty array
    return Response.json(result.length > 0 ? result : []);
  } catch (error) {
    console.error("Error fetching items:", error);
    
    // Return an empty array in case of an error
    return Response.json([]);
  }

}