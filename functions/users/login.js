import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import Joi from "joi";
import validateInput from "../../middlewares/validateInput.js";
import { getItem } from "../../utils/dbHelper.js";

const USERS_TABLE = "UsersTable"; // Naziv tabele u DynamoDB

// Glavna funkcija za login
const login = async (event) => {
    const { username, password } = event.body; // Dohvatanje podataka iz zahteva

    // Dohvatanje korisnika iz DynamoDB prema korisničkom imenu
    const user = await getItem(USERS_TABLE, { username });

    // Provera da li korisnik postoji
    if (!user) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Invalid username or password" }),
        };
    }

    // Provera da li je lozinka ispravna
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Invalid username or password" }),
        };
    }

    // Generisanje JWT tokena
    const token = jwt.sign(
        { id: user.username }, // Podaci koje token nosi
        process.env.JWT_SECRET, // Sigurnosni ključ
        { expiresIn: "1h" } // Token ističe za 1 sat
    );

    // Povratni odgovor sa tokenom
    return {
        statusCode: 200,
        body: JSON.stringify({ token }),
    };
};

// Validacija ulaznih podataka
const loginSchema = Joi.object({
    username: Joi.string().required(), // Korisničko ime je obavezno
    password: Joi.string().required(), // Lozinka je obavezna
});

// Export funkcije uz middy middlewares
export default middy(login)
    .use(jsonBodyParser()) // Parsiranje JSON tela zahteva
    .use(validateInput(loginSchema)); // Validacija podataka
