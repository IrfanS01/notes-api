const AWS = require("aws-sdk");
const bcrypt = require("bcrypt");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");
const validateInput = require("../../middlewares/validateInput");
const Joi = require("joi");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = "UsersTable";

const signup = async (event) => {
    const { username, password } = JSON.parse(event.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    await dynamodb
        .put({
            TableName: USERS_TABLE,
            Item: { username, password: hashedPassword },
        })
        .promise();

    return {
        statusCode: 201,
        body: JSON.stringify({ message: "User created" }),
    };
};

const signupSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
});

module.exports = middy(signup)
    .use(jsonBodyParser())
    .use(validateInput(signupSchema));
