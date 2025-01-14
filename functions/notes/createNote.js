import AWS from "aws-sdk";
import middy from "@middy/core";
import authMiddleware from "../../middlewares/authMiddleware.js";
import jsonBodyParser from "@middy/http-json-body-parser";
import Joi from "joi";
import validateInput from "../../middlewares/validateInput.js";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const NOTES_TABLE = "NotesTable";

// Glavna funkcija za kreiranje beleške
const createNote = async (event) => {
    console.log("Handler createNote invoked"); // Log početka
    console.log("User info from event:", event.user); // Log korisnika

    const { userId } = event.user;
    const { title, text } = event.body;

    console.log("Extracted body fields:", { title, text }); // Log polja iz body

    const newNote = {
        id: `${userId}-${Date.now()}`, // Generiše jedinstveni ID koristeći userId i timestamp
        userId,
        title,
        text,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
    };

    console.log("New note object:", newNote); // Log kreirane beleške pre unosa u DynamoDB

    try {
        await dynamodb
            .put({
                TableName: NOTES_TABLE,
                Item: newNote,
            })
            .promise();
        console.log("Note successfully inserted into DynamoDB"); // Log uspešnog unosa
    } catch (error) {
        console.error("Error inserting note into DynamoDB:", error.message); // Log greške
        throw new Error("Could not create note. Please try again.");
    }

    return {
        statusCode: 201,
        body: JSON.stringify({ message: "Note created", note: newNote }),
    };
};

// Validacija ulaznih podataka
const createNoteSchema = Joi.object({
    title: Joi.string().max(50).required(),
    text: Joi.string().max(300).required(),
});

export const createNoteHandler = middy(createNote)
    .use(jsonBodyParser())
    .use(authMiddleware())
    .use(validateInput(createNoteSchema));

