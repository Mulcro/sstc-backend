const allowedOrigins = [
    //VS Code postman agent apparently has an undefined origin. Remember to remove this in production
    undefined,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4000',
    'http://localhost:4000',
    'http://127.0.0.1:4173',
    "https://web.postman.co"
];

module.exports = allowedOrigins;
