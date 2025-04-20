const { MongoClient } = require('mongodb');
const User = require("./models/UserModel");
const Company = require("./models/Company");
const CompanyUser = require("./models/CompanyUsers");
const url = 'mongodb://localhost:27017'; // MongoDB connection URL
const dbName = 'finance';    // The name of your database

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
        const collection = db.collection('companies'); // Your collection name

        // Find all documents in the collection
        const records = await collection.find({}).toArray(); // Use any query to filter data
        for (let item of records) {
            const users = item.users;
            // Find the user by account ID

            const company = await Company.create({
                uid: item._id.toString(),
                name: item.name,  // Fixed concatenation
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            });

            for (let user of users) {
                const recordfound = await User.findOne({
                    where: {
                        uid: user.toString()  // Search by username
                    }
                });

                recordfound.company_id = company.id;
                recordfound.save();

                if (recordfound.user_type === 'Company') {
                    await CompanyUser.create({
                        company_id: company.id,
                        user_id: recordfound.id
                    });
                }

            }
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
