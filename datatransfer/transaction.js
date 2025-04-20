const { MongoClient } = require('mongodb');
// const User = require("./models/UserModel");
const Company = require("./models/Company");
const User = require("./models/UserModel");
const subAccount = require("./models/subAccounts");
const Transaction = require("./models/Transaction");
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
        const collection = db.collection('transactions'); // Your collection name

        // Find all documents in the collection
        const records = await collection.find({}).toArray(); // Use any query to filter data
        for (let item of records) {
            // const company_id = item.company_id.toString();
            const sender_sub_account_id = item.sender_sub_account_id.toString();
            const receiver_sub_account_id = item.receiver_sub_account_id.toString();
            const company_id = item.company_id.toString();
            const sender_id = item.sender_id.toString();
            const receiver_id = item.receiver_id.toString();
            
            const company = await Company.findOne({
                where: {
                    uid: company_id
                }
            });

            const SendersubAccountID = await subAccount.findOne({
                where: {
                    uid: sender_sub_account_id
                }
            });

            const ReceiversubAccountID = await subAccount.findOne({
                where: {
                    uid: receiver_sub_account_id
                }
            });


            const Senderuser = await User.findOne({
                where: {
                    uid: sender_id
                }
            });

            const Receiveruser = await User.findOne({
                where: {
                    uid: receiver_id
                }
            });


            await Transaction.create({
                uid: item._id.toString(),
                transaction_date: item.transaction_date,
                narration: item.narration,
                company_id: company.id,
                sender_sub_account_id: SendersubAccountID.id,
                receiver_sub_account_id: ReceiversubAccountID.id,
                sender_id: Senderuser.id,
                receiver_id: Receiveruser.id,
                notes: item.notes,
                amount: item.amount.toString(),
                is_default: item.is_default,
                is_deleted: item.is_deleted,
                deleted_at: item.deleted_at,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            });

            // console.log(company);
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
