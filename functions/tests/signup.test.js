const signup = require("../../functions/users/signup");

test("Signup should return 201 if user is created", async () => {
    const event = {
        body: JSON.stringify({ username: "testuser", password: "password123" }),
    };

    const response = await signup.handler(event);
    expect(response.statusCode).toBe(201);
});
