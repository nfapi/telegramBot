FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Cloud Run expects port from PORT env var; default to 8080
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]
