import AWS from "../config/awsConfig.js";
import awsConfig from "../config/awsConfig.js";


const dynamodb = new AWS.DynamoDB.DocumentClient();

// Funkcija za dobijanje stavke iz tabele
export const getItem = async (TableName, Key) => {
    try {
        const result = await dynamodb.get({ TableName, Key }).promise();
        return result.Item;
    } catch (error) {
        console.error(`Error getting item from ${TableName}:`, error.message);
        throw new Error(`Error getting item: ${error.message}`);
    }
};

// Funkcija za unos stavke u tabelu
export const putItem = async (TableName, Item) => {
    try {
        await dynamodb.put({ TableName, Item }).promise();
        return { success: true };
    } catch (error) {
        console.error(`Error putting item in ${TableName}:`, error.message);
        throw new Error(`Error putting item: ${error.message}`);
    }
};

// Funkcija za ažuriranje stavke u tabeli
export const updateItem = async (TableName, Key, UpdateExpression, ExpressionAttributeValues) => {
    try {
        const result = await dynamodb
            .update({
                TableName,
                Key,
                UpdateExpression,
                ExpressionAttributeValues,
                ReturnValues: "UPDATED_NEW",
            })
            .promise();
        return result.Attributes;
    } catch (error) {
        console.error(`Error updating item in ${TableName}:`, error.message);
        throw new Error(`Error updating item: ${error.message}`);
    }
};

// Funkcija za brisanje stavke iz tabele
export const deleteItem = async (TableName, Key) => {
    try {
        await dynamodb.delete({ TableName, Key }).promise();
        return { success: true };
    } catch (error) {
        console.error(`Error deleting item from ${TableName}:`, error.message);
        throw new Error(`Error deleting item: ${error.message}`);
    }
};

// Funkcija za pretragu (query) tabele
export const queryTable = async (TableName, KeyConditionExpression, ExpressionAttributeValues) => {
    try {
        const result = await dynamodb
            .query({
                TableName,
                KeyConditionExpression,
                ExpressionAttributeValues,
            })
            .promise();
        return result.Items;
    } catch (error) {
        console.error(`Error querying table ${TableName}:`, error.message);
        throw new Error(`Error querying table: ${error.message}`);
    }
};
