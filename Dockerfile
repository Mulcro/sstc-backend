FROM node:22.11.0

# Install Redis
RUN apt-get update && apt-get install -y redis-server

WORKDIR /app

COPY . .

COPY package*.json ./

RUN npm install

EXPOSE 5000

# Expose Redis port
EXPOSE 6379

# Start Redis and Node.js app
CMD service redis-server start && npm run start
