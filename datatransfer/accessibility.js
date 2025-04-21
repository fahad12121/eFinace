const { MongoClient } = require('mongodb');
const User = require("../models/UserModel");
const Accessibility = require("../models/Accessbility");
const url = 'mongodb://localhost:27017'; // MongoDB connection URL
const dbName = 'efinance_live';    // MongoDB database name
const client = new MongoClient(url, { useUnifiedTopology: true });

async function main() {
  try {
    // Connect to MongoDB client
    await client.connect();
    console.log('Connected to MongoDB');

    // Get MongoDB database and collection
    const db = client.db(dbName);
    const collection = db.collection('accessibilities'); // MongoDB collection

    // Fetch all records from MongoDB
    const records = await collection.find({}).toArray();

    // Loop through MongoDB records and insert them into MySQL
    for (let item of records) {
      // Find the user by MongoDB user_id (matching uid in the MySQL User model)
      const recordfound = await User.findOne({
        where: {
          uid: item.user_id.toString()  // Search by user_id converted to string
        }
      });

      // Initialize array to hold IDs for viewable accounts
      const viewableAccountsArray = [];

      // Loop through the viewable accounts and find the user by UID
      for (let account of item.viewable_accounts) {
        const accountUser = await User.findOne({
          where: {
            uid: account.toString() // Search by each account's UID (convert to string)
          }
        });

        if (accountUser) {
          // Push the corresponding user ID to the viewable accounts array
          viewableAccountsArray.push(accountUser.id);
        }
      }

      // Create the new accessibility record to insert into MySQL
      const newAccessibility = {
        viewable_accounts: viewableAccountsArray,  // Array of user IDs
        uid: item._id.toString(),  // Map MongoDB _id to uid field
        accounts: item.accounts,   // Directly assign the `accounts` object
        transactions: item.transactions,  // Directly assign the `transactions` object
        account_types: item.account_types,  // Directly assign the `account_types` object
        balance_sheet: item.balance_sheet,  // Directly assign the `balance_sheet` object
        import: item.import,  // Directly assign the `import` object
        user_id: recordfound.id,  // MySQL user ID (from the User model)
        createdAt: item.created_at,  // Ensure the correct Date format
        updatedAt: item.updated_at,  // Ensure the correct Date format
      };

      // Insert the mapped data into MySQL's 'accessibilities' table using Sequelize
      await Accessibility.create(newAccessibility);

      console.log(`Inserted Accessibility data for user_id: ${item.user_id}`);
    }

    console.log('All records successfully migrated from MongoDB to MySQL');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close MongoDB connection
    await client.close();
  }
}

main();
