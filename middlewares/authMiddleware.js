import jwt from "jsonwebtoken";

const authMiddleware = () => {
    return {
        before: async (handler) => {
            // Dohvatanje Authorization tokena iz header-a
            const token = handler.event.headers.Authorization;

            if (!token) {
                // Bacamo grešku ako token ne postoji
                throw new Error("Unauthorized: Missing Authorization header");
            }

            try {
                // Validacija tokena koristeći sigurnosni ključ iz environment promenljive
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Dodajemo dekodirane podatke korisnika u `event` objekat
                handler.event.user = decoded;
            } catch (err) {
                console.error("Token validation error:", err.message);

                // Specifično rukovanje greškama
                if (err.name === "TokenExpiredError") {
                    throw new Error("Unauthorized: Token expired");
                } else if (err.name === "JsonWebTokenError") {
                    throw new Error("Unauthorized: Invalid token");
                } else {
                    throw new Error("Unauthorized: Token verification failed");
                }
            }
        },
    };
};

export default authMiddleware;
