import Joi from "joi";

const validateInput = (schema) => {
    return {
        before: async (handler) => {
            // Provera broja ključeva
            const keys = Object.keys(handler.event.body);
            const expectedKeys = Object.keys(schema.describe().keys);

            if (keys.length > expectedKeys.length) {
                handler.event.error = "Validation error: Too many keys in request body";
                handler.event.errorCode = 400;
                throw new Error();
            }

            // Validacija pomoću Joi
            const { error } = schema.validate(handler.event.body, { abortEarly: false });
            if (error) {
                handler.event.error = `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
                handler.event.errorCode = 400;
                throw new Error();
            }
        },
    };
};

export default validateInput;
