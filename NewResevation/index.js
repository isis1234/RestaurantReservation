require("dotenv").config()
const { MongoClient } = require('mongodb');

const getDBConnection = async (event, context) => {
    try {
      const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=RestaurantReservation`;
      console.log(url)
      const client = new MongoClient(url);
      return client;
    } catch(err) {
        throw(err)
    }
}

const main = async function(event, context){
  // event = {
  //   body: JSON.stringify({
  //     restaurant_name: "挽肉と米",
  //     reg_people: 4,
  //     reg_date: "2024-07-11",
  //     reg_time: "7pm",
  //     contact_method: "telegram",
  //     telegram: "uuuuuzx",
  //     whatsapp: null,
  //   })
  // };
  const mongo = await getDBConnection();

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const {
      restaurant_name, reg_people, reg_date, reg_time, contact_method, telegram, whatsapp,
      created_date = new Date()
    } = requestBody;

    // Insert record
    await mongo.connect();
    await mongo.db(process.env.MONGO_DB).collection(process.env.MONGO_COLLECTION).insertOne({ ...requestBody, created_date });

    // Response
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": process.env.ORIGIN,
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify({
        requestBody, created_date,
      })
    };
    console.log(response);
    return response;
  } catch (err) {
    return formatError(err);
  } finally {
    await mongo.close();
  }
};

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

// main();
exports.handler = main;