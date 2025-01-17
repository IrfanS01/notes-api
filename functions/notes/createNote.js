import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid"; // Dodato za generisanje UUID
import middy from "@middy/core";
import authMiddleware from "../../middlewares/authMiddleware.js";
import jsonBodyParser from "@middy/http-json-body-parser";
import Joi from "joi";
import validateInput from "../../middlewares/validateInput.js";
import httpErrorHandler from "@middy/http-error-handler";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const NOTES_TABLE = "NotesTable";

const createNote = async (event) => {
    const { userId } = event.user;
    const { title, text } = event.body;

    const newNoteId = `${userId}-${Date.now()}`; // Kombinacija userId i trenutnog timestamp-a
 // Generišemo jedinstveni ID
    const newNote = {
        id: newNoteId,
        userId,
        title,
        text,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
    };

    // Proverite da li beleška već postoji
    const existingNote = await dynamodb
        .get({ TableName: NOTES_TABLE, Key: { id: newNoteId, userId } })
        .promise();

    if (existingNote.Item) {
        throw new Error("Note with this ID already exists");
    }

    try {
        await dynamodb
            .put({
                TableName: NOTES_TABLE,
                Item: newNote,
            })
            .promise();
    } catch (error) {
        throw new Error("Could not create note. Please try again.");
    }

    return {
        statusCode: 201,
        body: JSON.stringify({ message: "Note created", note: newNote }),
    };
};

const createNoteSchema = Joi.object({
    title: Joi.string().max(50).required(),
    text: Joi.string().max(300).required(),
});

export const createNoteHandler = middy(createNote)
    .use(jsonBodyParser())
    .use(authMiddleware())
    .use(validateInput(createNoteSchema))
    .use(httpErrorHandler());
