require("dotenv").config()
const { MongoClient } = require('mongodb');
const axios = require('axios');

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
    const created_date = new Date();

    // Insert record
    await mongo.connect();
    await mongo.db(process.env.MONGO_DB).collection(process.env.MONGO_COLLECTION).insertOne({ ...requestBody, created_date });

    if (requestBody.telegram) {
      const { id: telegramId } = JSON.parse(requestBody.telegram);
      let text = ``;
      text += `<b>Booking ${requestBody.restaurant_name}</b>\n`;
      text += `- 人數: ${requestBody.reg_people}\n`;
      text += `- 時間: ${requestBody.reg_date} ${requestBody.reg_time}\n`;
      text += `有位再叫\n`;
      await axios.post(`https://api.telegram.org/bot${BOT_ID}:${BOT_PWD}/sendMessage`, {
        chat_id: 977592,
        parse_mode: "html",
        "text": text
      });
    }

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