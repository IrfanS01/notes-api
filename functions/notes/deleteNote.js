import AWS from "aws-sdk";
import middy from "@middy/core";
import authMiddleware from "../../middlewares/authMiddleware.js";
import jsonBodyParser from "@middy/http-json-body-parser";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const NOTES_TABLE = "NotesTable";

const deleteNote = async (event) => {
    const { userId } = event.user;
    const { noteId } = event.body;

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

export default middy(deleteNote)
    .use(jsonBodyParser())
    .use(authMiddleware());
