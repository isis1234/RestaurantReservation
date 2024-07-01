require("dotenv").config()
const { MongoClient } = require('mongodb');

const getDBConnection = async (event, context) => {
  try {
    const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=${process.env.MONGO_DB}`;
    const client = new MongoClient(url);
    return client;
  } catch(err) {
      throw(err)
  }
}

const main = async function(event, context){
  const mongo = await getDBConnection();
  await mongo.connect();

  try {
    // return response;
  } catch (err) {
    return formatError(err);
  } finally {
    await mongo.close();
  }
}
const formatError = function(error){
  const response = {
    "statusCode": error.statusCode,
    "headers": {
      "Content-Type": "text/plain",
      "x-amzn-ErrorType": error.code
    },
    "isBase64Encoded": false,
    "body": error.code + ": " + error.message
  }
  console.log("??", error);
  return response
}

main();
// exports.handler = main;