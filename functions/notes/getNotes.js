import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler"; // Dodano
import createError from "http-errors"; // Dodano
import authMiddleware from "../../middlewares/authMiddleware.js";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const NOTES_TABLE = "NotesTable";

const getNotes = async (event) => {
  console.log("Pokretanje funkcije getNotes");
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    const { userId } = event.user;

    if (!userId) {
      // Ako userId nije prisutan, baci grešku
      throw new createError.BadRequest("userId nije definisan.");
    }

    const result = await dynamodb
      .query({
        TableName: NOTES_TABLE,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
      })
      .promise();

    if (!result.Items || result.Items.length === 0) {
      throw new createError.NotFound("Bilješke nisu pronađene za ovog korisnika.");
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
      message: "Bilješke uspješno dohvaćene",
    };
  } catch (error) {
    console.error("Greška u funkciji getNotes:", error);
    throw error; // Greška će biti automatski obrađena od strane httpErrorHandler-a
  }
};

// Dodaj @middy/http-error-handler u chain middlewares
export const handler = middy(getNotes)
  .use(authMiddleware()) // Tvoj custom middleware za autentifikaciju
  .use(httpErrorHandler()); // Automatsko procesuiranje grešaka
