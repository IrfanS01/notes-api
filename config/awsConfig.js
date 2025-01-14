import dotenv from "dotenv";
import AWS from "aws-sdk";

// Učitavanje environment varijabli iz .env fajla
dotenv.config();

// Postavljanje podrazumevane regije
const awsRegion = process.env.AWS_REGION || "eu-north-1"; // Koristi "eu-north-1" ako AWS_REGION nije definisan

AWS.config.update({
    region: awsRegion,
});

export default AWS;
