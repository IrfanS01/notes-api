import jwt from "jsonwebtoken";

const authMiddleware = () => {
    return {
        before: async (handler) => {
            console.log("AuthMiddleware invoked"); // Log na početku middleware-a

            // Dohvatanje Authorization header-a (prihvata oba slučaja)
            const authHeader = handler.event.headers.Authorization || handler.event.headers.authorization;
            console.log("Authorization header:", authHeader); // Log sadržaja header-a

            if (!authHeader) {
                console.error("Authorization header is missing"); // Log za nedostatak header-a
                throw new Error("Unauthorized: Missing Authorization header");
            }

            // Proverite da li Authorization header počinje sa "Bearer "
            if (!authHeader.startsWith("Bearer ")) {
                console.error("Invalid Authorization header format"); // Log za nevalidan format
                throw new Error("Unauthorized: Invalid Authorization header format");
            }

            // Izvlačenje tokena iz header-a
            const token = authHeader.split(" ")[1]; // Uklanjamo "Bearer " prefiks
            console.log("Extracted token:", token); // Log tokena

            try {
                // Validacija tokena
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log("Decoded token:", decoded); // Log dekodiranih podataka

                // Dodavanje dekodiranih podataka korisnika u `event` objekat
                handler.event.user = decoded;
            } catch (err) {
                console.error("Token validation error:", err.message); // Log greške tokom validacije

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
