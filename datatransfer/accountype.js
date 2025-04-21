const { MongoClient } = require('mongodb');
// const User = require("./models/UserModel");
const Company = require("../models/Company");
const accountType = require("../models/AccountType");
const url = 'mongodb://localhost:27017'; // MongoDB connection URL
const dbName = 'efinance_live';    // The name of your database

// Create a new MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true });

async function main() {
    try {
        // Connect to the MongoDB client
        await client.connect();
        console.log('Connected to MongoDB');

        // Get the database
        const db = client.db(dbName);

        // Get the collection
        const collection = db.collection('accounttypes'); // Your collection name

        // Find all documents in the collection
        const records = await collection.find({}).toArray(); // Use any query to filter data
        for (let item of records) {
            const company_id = item.company_id.toString();

            const company = await Company.findOne({
                where: {
                    uid: company_id
                }
            });

            // console.log(company);

            await accountType.create({
                uid: item._id.toString(),
                name: item.name,
                company_id: company.id,
                is_active: item.is_active,
                is_default: item.is_default,
                is_deleted: item.is_deleted,
                deleted_at: item.deleted_at,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            });
        }
        // const newUser = await User.create(data);
        console.log('Users successfully migrated from MongoDB to MySQL');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Close the client
        await client.close();
    }
}

main();
