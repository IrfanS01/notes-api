import jwt from "jsonwebtoken";
import createError from "http-errors"; // Za kreiranje grešaka sa status kodovima

const authMiddleware = () => {
    return {
        before: async (handler) => {
            console.log("AuthMiddleware invoked");

            // Dohvatanje Authorization header-a
            const authHeader = handler.event.headers.Authorization || handler.event.headers.authorization;

            if (!authHeader) {
                console.error("Authorization header is missing");
                throw new createError.Unauthorized("Missing Authorization header");
            }

            // Provera formata header-a
            if (!authHeader.startsWith("Bearer ")) {
                console.error("Invalid Authorization header format");
                throw new createError.Unauthorized("Invalid Authorization header format");
            }

            const token = authHeader.split(" ")[1]; // Izvlačenje tokena

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET); // Validacija tokena
                handler.event.user = decoded; // Dodaj korisničke podatke u event
            } catch (err) {
                console.error("Token validation error:", err.message);

                if (err.name === "TokenExpiredError") {
                    throw new createError.Unauthorized("Token expired");
                } else if (err.name === "JsonWebTokenError") {
                    throw new createError.Unauthorized("Invalid token");
                } else {
                    throw new createError.Unauthorized("Token verification failed");
                }
            }
        },
    };
};

export default authMiddleware;
