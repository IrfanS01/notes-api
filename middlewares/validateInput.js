import Joi from "joi";

console.log("validateInput.js has been loaded"); // Log za proveru

const validateInput = (schema) => {
    return {
        before: async (handler) => {
            // Proveri da li je body definisan i postavi fallback ako nije
            const keys = Object.keys(handler.event.body || {});
            const expectedKeys = Object.keys(schema.describe().keys);

            // Provera broja ključeva
            if (keys.length > expectedKeys.length) {
                handler.event.error = "Validation error: Too many keys in request body";
                handler.event.errorCode = 400;
                console.error("Validation Error:", handler.event.error);
                throw new Error(handler.event.error || "Unknown validation error");
            }

            // Validacija pomoću Joi
            const { error } = schema.validate(handler.event.body, { abortEarly: false });
            if (error) {
                // Logovanje grešaka radi lakšeg debugovanja
                console.error("Validation Error:", error.details.map((x) => x.message));
                
                handler.event.error = `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
                handler.event.errorCode = 400;

                // Bacanje greške sa opisom
                throw new Error(handler.event.error || "Unknown validation error");
            }
        },
    };
};

export default validateInput;
