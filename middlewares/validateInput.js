import Joi from "joi";

console.log("validateInput.js has been loaded"); // Log za proveru

const validateInput = (schema) => {
    return {
        before: async (handler) => {
            // Fallback za prazan body
            const body = handler.event.body || {};
            console.log("Validating input body:", body);

            // Opis šeme za dodatne provere
            const schemaKeys = Object.keys(schema.describe().keys);
            const bodyKeys = Object.keys(body);

            // Provera da li postoji višak ključeva
            if (bodyKeys.some((key) => !schemaKeys.includes(key))) {
                const extraKeys = bodyKeys.filter((key) => !schemaKeys.includes(key));
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
        },
    };
};

export default validateInput;
