import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import Joi from "joi";
import validateInput from "../../middlewares/validateInput.js";
import { getItem } from "../../utils/dbHelper.js";

const USERS_TABLE = "UsersTable"; // Naziv tabele u DynamoDB

const login = async (event) => {
    try {
        console.log("Received login request:", event.body);

        if (!event.body || !event.body.username || !event.body.password) {
            return {
                statusCode: 400, // Bad Request
                body: JSON.stringify({ message: "Username and password are required" }),
            };
        }

        const { username, password } = event.body;

        // Dohvatanje korisnika iz DynamoDB prema korisničkom imenu
        const user = await getItem(USERS_TABLE, { username });

        if (!user) {
            return {
                statusCode: 401, // Unauthorized
                body: JSON.stringify({ message: "Invalid username or password" }),
            };
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return {
                statusCode: 401, // Unauthorized
                body: JSON.stringify({ message: "Invalid username or password" }),
            };
        }

        const token = jwt.sign(
            { id: user.username }, // Podaci koje token nosi
            process.env.JWT_SECRET, // Sigurnosni ključ
            { expiresIn: "1h" } // Token ističe za 1 sat
        );

        console.log("User successfully logged in:", username);

        return {
            statusCode: 200, // Success
            body: JSON.stringify({ token }),
        };
    } catch (error) {
        console.error("Login error:", error);

        return {
            statusCode: 500, // Internal Server Error
            body: JSON.stringify({ message: "An error occurred during login" }),
        };
    }
};

const loginSchema = Joi.object({
    username: Joi.string().required(), // Korisničko ime je obavezno
    password: Joi.string().required(), // Lozinka je obavezna
});

export const handler = middy(login)
    .use(jsonBodyParser())
    .use(validateInput(loginSchema));

