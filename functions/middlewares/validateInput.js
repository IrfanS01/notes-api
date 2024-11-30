const validateInput = (schema) => {
    return {
        before: (handler) => {
            const { body } = handler.event;
            const data = JSON.parse(body);

            const { error } = schema.validate(data);
            if (error) {
                throw new Error(`Validation error: ${error.details[0].message}`);
            }
        },
    };
};

module.exports = validateInput;
