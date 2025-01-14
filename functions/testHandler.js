// functions/testHandler.js

// Ovo je minimalan primer handler-a koji vraća status 200 i poruku "Test OK"
export const handler = async (event) => {
    console.log("Handler loaded!");

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Test handler is working!" }),
    };
};
