const jwt = require("jsonwebtoken");

const authMiddleware = () => {
    return {
        before: async (handler) => {
            const token = handler.event.headers.Authorization;

            if (!token) {
                throw new Error("Unauthorized");
            }

            try {
                const decoded = jwt.verify(token, "your_secret_key"); // Zameni "your_secret_key" sigurnim ključem
                handler.event.user = decoded; // Dodaćemo podatke korisnika u event
            } catch (err) {
                throw new Error("Invalid token");
            }
        },
    };
};

module.exports = authMiddleware;
