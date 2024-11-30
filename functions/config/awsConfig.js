import dotenv from "dotenv";
import AWS from "aws-sdk";

dotenv.config();

AWS.config.update({
    region: process.env.AWS_REGION,
});

export default AWS;
