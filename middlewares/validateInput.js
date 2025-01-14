import Joi from "joi";

console.log("validateInput.js has been loaded"); // Log za proveru

const validateInput = (schema) => {
    return {
        before: async (handler) => {
            console.log("Starting validation..."); // Log početka validacije

            // Fallback za prazan body
            const body = handler.event.body || {};
            console.log("Request body to validate:", body); // Log sadržaja body

            // Opis šeme za dodatne provere
            const schemaKeys = Object.keys(schema.describe().keys);
            const bodyKeys = Object.keys(body);
            console.log("Schema keys:", schemaKeys); // Log definisanih ključeva u šemi
            console.log("Body keys:", bodyKeys); // Log ključeva iz zahteva

            // Provera da li postoji višak ključeva
            const extraKeys = bodyKeys.filter((key) => !schemaKeys.includes(key));
            if (extraKeys.length > 0) {
                console.error("Validation Error: Extra keys in request body:", extraKeys);
                throw new Error(`Validation error: Extra keys in request body: ${extraKeys.join(", ")}`);
            }

            // Joi validacija
            const { error } = schema.validate(body, { abortEarly: false });
            if (error) {
                const errorMessages = error.details.map((x) => x.message);
                console.error("Validation Error:", errorMessages);
                throw new Error(`Validation error: ${errorMessages.join(", ")}`);
            }

            console.log("Validation passed successfully"); // Log uspešne validacije
        },
    };
};

export default validateInput;
