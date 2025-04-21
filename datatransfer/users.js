const { MongoClient } = require('mongodb');
const User = require("../models/UserModel");

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
        const collection = db.collection('users'); // Your collection name

        // Find all documents in the collection
        const users = await collection.find({}).toArray(); // Use any query to filter data
        for (let user of users) {
            let userName = user?.first_name ? `${user?.first_name} ${user?.last_name}` : '';
            // Find the user by account ID
            await User.create({
                uid: user._id.toString(),
                name: userName,  // Fixed concatenation
                notes: user.notes,
                account_pk: user.account_pk,
                password: user.password,
                user_type: user.user_type,
                balance: parseFloat(user.balance.toString()),
                is_deleted: user.is_deleted,
                last_login: user.last_login,
                last_ip: user.last_ip == "Invalid date" ? new Date() : user.last_ip,
                username: user.username,
                // company_id: user.company_id,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
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
