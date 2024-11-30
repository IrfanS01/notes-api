import bcrypt from "bcryptjs";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import Joi from "joi";
import validateInput from "../../middlewares/validateInput.js";
import { putItem } from "../../utils/dbHelper.js";

const USERS_TABLE = "UsersTable"; // Naziv tabele u DynamoDB

// Glavna funkcija za signup
const signup = async (event) => {
    const { username, password } = event.body; // Dohvatanje podataka iz zahteva

    // Hesiranje lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    // Novi korisnik
    const newUser = {
        username, // Korisničko ime kao primarni ključ
        password: hashedPassword, // Hesirana lozinka
    };

    // Ubacivanje korisnika u DynamoDB
    await putItem(USERS_TABLE, newUser);

    // Povratna vrednost nakon uspešne registracije
    return {
        statusCode: 201,
        body: JSON.stringify({ message: "User created successfully" }),
    };
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
export default middy(signup)
    .use(jsonBodyParser()) // Parsiranje JSON tela zahteva
    .use(validateInput(signupSchema)); // Validacija podataka
