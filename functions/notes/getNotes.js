import AWS from "aws-sdk";
import middy from "@middy/core";
import authMiddleware from "../../middlewares/authMiddleware.js";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const NOTES_TABLE = "NotesTable";

const getNotes = async (event) => {
    const { userId } = event.user;

    const result = await dynamodb
        .query({
            TableName: NOTES_TABLE,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: { ":userId": userId },
        })
        .promise();

    return {
        statusCode: 200,
        body: JSON.stringify(result.Items),
    };
};

export default middy(getNotes).use(authMiddleware());
