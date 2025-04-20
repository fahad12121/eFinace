const { MongoClient } = require('mongodb');
// const User = require("./models/UserModel");
const Company = require("./models/Company");
const User = require("./models/UserModel");
const subAccount = require("./models/subAccounts");
const Transaction = require("./models/Transaction");
const AccountStatement = require("./models/AccountStatement");
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
        const collection = db.collection('accountstatements'); // Your collection name

        // Find all documents in the collection
        const records = await collection.find({}).toArray(); // Use any query to filter data
        for (let item of records) {
            console.log(item.transaction_date.toString());
            // const company_id = item.company_id.toString();
            const sub_account_id = item.sub_account_id.toString();
            const other_sub_account_id = item.other_sub_account_id.toString();
            // const company_id = item.company_id.toString();
            const user_id = item.user_id.toString();
            const other_user_id = item.other_user_id.toString();
            const transaction_id = item.transaction_id.toString();

            // const company = await Company.findOne({
            //     where: {
            //         uid: company_id
            //     }
            // });

            const SendersubAccountID = await subAccount.findOne({
                where: {
                    uid: sub_account_id
                }
            });

            const ReceiversubAccountID = await subAccount.findOne({
                where: {
                    uid: other_sub_account_id
                }
            });


            const Senderuser = await User.findOne({
                where: {
                    uid: user_id
                }
            });

            const Receiveruser = await User.findOne({
                where: {
                    uid: other_user_id
                }
            });

            const transaction = await Transaction.findOne({
                where: {
                    uid: transaction_id
                }
            });


            await AccountStatement.create({
                uid: item._id.toString(),
                transaction_date: transaction.transaction_date,
                narration: item.narration,
                company_id: Senderuser.company_id,
                sub_account_id: SendersubAccountID.id,
                other_sub_account_id: ReceiversubAccountID.id,
                user_id: Senderuser.id,
                other_user_id: Receiveruser.id,
                transaction_id: transaction.id,
                notes: item.notes,
                amount: item.amount.toString(),
                balance: item.balance.toString(),
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
