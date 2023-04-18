const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

// connect to db
module.exports.connect = async () => {
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
  }
  const uri = await mongod.getUri();
  const mongooseOpts = {
    // useNewUrlParse: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
  };
  await mongoose.connect(uri, mongooseOpts);
};

// disconnect and close connection
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

// clear the db, remove all data
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
