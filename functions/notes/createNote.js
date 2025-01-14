import AWS from "aws-sdk";
import middy from "@middy/core";
import authMiddleware from "../../middlewares/authMiddleware.js";
import jsonBodyParser from "@middy/http-json-body-parser";
import Joi from "joi";
import validateInput from "../../middlewares/validateInput.js";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const NOTES_TABLE = "NotesTable";

const createNote = async (event) => {
    const { userId } = event.user;
    const { title, text } = event.body;

    const newNote = {
        id: `${userId}-${Date.now()}`, // Generiše jedinstveni ID koristeći userId i timestamp
        userId,
        title,
        text,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
    };

    await dynamodb
        .put({
            TableName: NOTES_TABLE,
            Item: newNote,
        })
        .promise();

    return {
        statusCode: 201,
        body: JSON.stringify({ message: "Note created", note: newNote }),
    };
};

// Validacija ulaznih podataka
const createNoteSchema = Joi.object({
    title: Joi.string().max(50).required(),
    text: Joi.string().max(300).required(),
});

export const handler = middy(createNote)
  .use(jsonBodyParser())
  .use(authMiddleware())
  .use(validateInput(createNoteSchema));