import AWS from "aws-sdk";
import middy from "@middy/core";
import authMiddleware from "../../middlewares/authMiddleware.js";
import jsonBodyParser from "@middy/http-json-body-parser";
import { handler } from "./createnote.js";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const NOTES_TABLE = "NotesTable";

const deleteNote = async (event) => {
    const { userId } = event.user;
    const { noteId } = event.body;

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
        .delete({
            TableName: NOTES_TABLE,
            Key: {
                id: noteId,
                userId: userId,
            },
        })
        .promise();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Note deleted successfully" }),
    };
};

export const handler = middy(deleteNote)
    .use(jsonBodyParser())
    .use(authMiddleware());
