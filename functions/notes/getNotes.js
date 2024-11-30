const AWS = require("aws-sdk");
const middy = require("@middy/core");
const authMiddleware = require("../../middlewares/authMiddleware");

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

module.exports = middy(getNotes).use(authMiddleware());
