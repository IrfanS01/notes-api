import AWS from "aws-sdk";
import middy from "@middy/core";
import authMiddleware from "../../middlewares/authMiddleware.js";
import jsonBodyParser from "@middy/http-json-body-parser";
import Joi from "joi";
import validateInput from "../../middlewares/validateInput.js";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const NOTES_TABLE = "NotesTable";

const updateNote = async (event) => {
    const { userId } = event.user;
    const { noteId, title, text } = event.body;

    const paramsGet = {
        TableName: NOTES_TABLE,
        Key: { id: noteId, userId },
      };
      const existingNote = await dynamodb.get(paramsGet).promise();
      
      if (!existingNote || !existingNote.Item) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Note not found" }),
          };
      }

    await dynamodb
        .update({
            TableName: NOTES_TABLE,
            Key: { id: noteId, userId: userId },
            UpdateExpression: "set title = :title, text = :text, modifiedAt = :modifiedAt",
            ExpressionAttributeValues: {
                ":title": title,
                ":text": text,
                ":modifiedAt": new Date().toISOString(),
            },
            ReturnValues: "UPDATED_NEW",
        })
        .promise();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Note updated successfully" }),
    };
};

// Validacija ulaznih podataka
const updateNoteSchema = Joi.object({
    noteId: Joi.string().required(),
    title: Joi.string().max(50).required(),
    text: Joi.string().max(300).required(),
});

export const handler = middy(updateNote)
    .use(jsonBodyParser())
    .use(authMiddleware())
    .use(validateInput(updateNoteSchema));
