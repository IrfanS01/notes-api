import jwt from "jsonwebtoken";

const authMiddleware = () => {
    return {
        before: async (handler) => {
            console.log("AuthMiddleware invoked"); // Log na početku middleware-a

            try {
                // Dohvatanje Authorization header-a (prihvata oba slučaja)
                const authHeader = handler.event.headers.Authorization || handler.event.headers.authorization;
                console.log("Authorization header:", authHeader); // Log sadržaja header-a

                if (!authHeader) {
                    console.error("Authorization header is missing"); // Log za nedostatak header-a
                    const error = new Error("Unauthorized: Missing Authorization header");
                    error.statusCode = 401; // Dodajemo odgovarajući status kod
                    throw error;
                }

                // Proverite da li Authorization header počinje sa "Bearer "
                if (!authHeader.startsWith("Bearer ")) {
                    console.error("Invalid Authorization header format"); // Log za nevalidan format
                    const error = new Error("Unauthorized: Invalid Authorization header format");
                    error.statusCode = 401; // Dodajemo odgovarajući status kod
                    throw error;
                }

                // Izvlačenje tokena iz header-a
                const token = authHeader.split(" ")[1]; // Uklanjamo "Bearer " prefiks
                console.log("Extracted token:", token); // Log tokena

                // Validacija tokena
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log("Decoded token:", decoded); // Log dekodiranih podataka

                // Dodavanje dekodiranih podataka korisnika u `event` objekat
                handler.event.user = decoded;
            } catch (err) {
                console.error("Token validation error:", err.message); // Log greške tokom validacije

                // Specifično rukovanje greškama
                if (err.name === "TokenExpiredError") {
                    const error = new Error("Unauthorized: Token expired");
                    error.statusCode = 401; // Dodajemo odgovarajući status kod
                    throw error;
                } else if (err.name === "JsonWebTokenError") {
                    const error = new Error("Unauthorized: Invalid token");
                    error.statusCode = 401; // Dodajemo odgovarajući status kod
                    throw error;
                }

                // Opšta greška vezana za verifikaciju tokena
                const error = new Error("Unauthorized: Token verification failed");
                error.statusCode = 401; // Dodajemo odgovarajući status kod
                throw error;
            }
        },
    };
};

export default authMiddleware;
