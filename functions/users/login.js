import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import Joi from "joi";
import validateInput from "../../middlewares/validateInput.js";
import { getItem } from "../../utils/dbHelper.js";

const USERS_TABLE = "UsersTable";

const login = async (event) => {
    console.log("Event body:", event.body); // Proverite JSON body

    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing request body" }),
        };
    }

    const { username, password } = event.body;
    console.log("Parsed username and password:", username, password);

    try {
        console.log("Fetching user with username:", username);
        const user = await getItem(USERS_TABLE, { username });
        console.log("Fetched user:", user);

        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Invalid username or password" }),
            };
        }

        console.log("Validating password for user:", username);
        const validPassword = await bcrypt.compare(password, user.password);
        console.log("Password validation result:", validPassword);

        if (!validPassword) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Invalid username or password" }),
            };
        }

        const token = jwt.sign(
            { id: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("User successfully logged in:", username);

        return {
            statusCode: 200,
            body: JSON.stringify({ token }),
        };
    } catch (error) {
        console.error("Error during login:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An error occurred during login" }),
        };
    }
};

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

export default middy(login)
    .use(jsonBodyParser())
    .use(validateInput(loginSchema));
