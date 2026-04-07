FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 6060

CMD ["npm", "start"]
# Deploy → dùng Docker (npm start)