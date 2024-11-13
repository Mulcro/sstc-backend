FROM node:22.11.0

USER root

# Install Redis
RUN apt-get update && apt-get install -y redis-server

WORKDIR /app

COPY . .

COPY package*.json ./

RUN npm install

# Ensure start.sh is executable
RUN chmod +x start.sh

# Expose Redis port
EXPOSE 5000
EXPOSE 6379

# Start Redis and Node.js app
CMD ["sh", "-c", "./start.sh"]
