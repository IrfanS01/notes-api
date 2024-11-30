const responseHelper = (statusCode, message, data = null) => {
    return {
        statusCode,
        body: JSON.stringify({ message, data }),
    };
};

module.exports = responseHelper;
