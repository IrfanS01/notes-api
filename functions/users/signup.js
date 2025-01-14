import bcrypt from "bcryptjs";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import Joi from "joi";
import validateInput from "../../middlewares/validateInput.js";
import { putItem } from "../../utils/dbHelper.js";

const USERS_TABLE = "UsersTable"; // Naziv tabele u DynamoDB

const signup = async (event) => {
    console.log("Signup event body:", event.body); // Log celog ulaza

    try {
        const { username, password } = event.body; // Dohvatanje podataka iz zahteva
        console.log("Parsed username and password:", username, password);

        // Hesiranje lozinke
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password:", hashedPassword);

        // Novi korisnik
        const newUser = {
            username, // Korisničko ime kao primarni ključ
            password: hashedPassword, // Hesirana lozinka
        };

        console.log("New user object:", newUser);

        // Ubacivanje korisnika u DynamoDB
        await putItem(USERS_TABLE, newUser);
        console.log("User inserted into DynamoDB");

        // Povratna vrednost nakon uspešne registracije
        return {
            statusCode: 201,
            body: JSON.stringify({ message: "User created successfully" }),
        };
    } catch (error) {
        console.error("Error in signup function:", error); // Log greške
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An error occurred during signup" }),
        };
    }
};


// Validacija ulaznih podataka
const signupSchema = Joi.object({
    username: Joi.string()
        .min(3) // Minimalna dužina korisničkog imena
        .max(30) // Maksimalna dužina korisničkog imena
        .required(), // Polje je obavezno
    password: Joi.string()
        .min(6) // Minimalna dužina lozinke
        .max(50) // Maksimalna dužina lozinke
        .required(), // Polje je obavezno
});

// Export funkcije uz middy middlewares
export const handler = middy(signup)
    .use(jsonBodyParser()) // Parsiranje JSON tela zahteva
    .use(validateInput(signupSchema)); // Validacija podataka
