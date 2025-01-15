import bcrypt from "bcryptjs";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import Joi from "joi";
import validateInput from "../../middlewares/validateInput.js";
import createError from "http-errors";
import { putItem, getItem } from "../../utils/dbHelper.js";
import httpErrorHandler from "@middy/http-error-handler";

const USERS_TABLE = "UsersTable"; // Naziv tabele u DynamoDB

const signup = async (event) => {
    console.log("Signup event body:", event.body); // Log celog ulaza

    try {
        // Provera da li postoji telo zahteva
        if (!event.body) {
            console.error("Request body is missing.");
            throw new createError.BadRequest("Request body is missing.");
        }

        const { username, password } = event.body;

        console.log("Parsed username and password:", username, password);

        // Provera da li korisnik već postoji
        console.log("Checking if user exists...");
        const existingUser = await getItem(USERS_TABLE, { username });
        if (existingUser) {
            console.log("User already exists:", existingUser);
            throw new createError.Conflict("Username already exists.");
        }

        console.log("Username is available. Proceeding with signup...");

        // Hesiranje lozinke
        if (!password) {
            console.error("Password is missing.");
            throw new createError.BadRequest("Password is required.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password:", hashedPassword);

        // Novi korisnik
        const newUser = {
            username,
            password: hashedPassword,
        };

        console.log("New user object:", newUser);

        // Ubacivanje korisnika u DynamoDB
        await putItem(USERS_TABLE, newUser);
        console.log("User inserted into DynamoDB");

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "User created successfully" }),
        };
    } catch (error) {
        console.error("Error in signup function:", error); // Log greške
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify({ message: error.message || "An error occurred during signup" }),
        };
    }
};

// Validacija ulaznih podataka
const signupSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).max(50).required(),
});

export const handler = middy(signup)
    .use(jsonBodyParser())
    .use(validateInput(signupSchema))
    .use(httpErrorHandler());