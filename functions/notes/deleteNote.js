import AWS from "aws-sdk";
import middy from "@middy/core";
import authMiddleware from "../../middlewares/authMiddleware.js";
import jsonBodyParser from "@middy/http-json-body-parser";
import validateInput from "../../middlewares/validateInput.js";
import Joi from "joi"; // Import Joi
import httpErrorHandler from "@middy/http-error-handler";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const NOTES_TABLE = "NotesTable";

const deleteNote = async (event) => {
    console.log("Delete Note Handler Invoked");

    const { userId } = event.user;
    const { noteId } = event.body;

    console.log("Received User ID:", userId);
    console.log("Received Note ID:", noteId);

    const paramsGet = {
        TableName: NOTES_TABLE,
        Key: { id: noteId, userId },
    };

    console.log("Checking if note exists with params:", paramsGet);

    const existingNote = await dynamodb.get(paramsGet).promise();

    if (!existingNote || !existingNote.Item) {
        console.error("Note not found");
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Note not found" }),
        };
    }

    console.log("Note found, deleting note...");

    await dynamodb
        .delete({
            TableName: NOTES_TABLE,
            Key: {
                id: noteId,
                userId: userId,
            },
        })
        .promise();

    console.log("Note deleted successfully");

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Note deleted successfully" }),
    };
};

const deleteNoteSchema = Joi.object({
    noteId: Joi.string().required(), // Validacija za noteId
});

export const deleteNoteHandler = middy(deleteNote)
    .use(jsonBodyParser())
    .use(authMiddleware())
    .use(validateInput(deleteNoteSchema)) // Validacija
    .use(httpErrorHandler()); // Automatsko rukovanje greškama
