FROM node:20

WORKDIR /webapp

COPY package* . 
COPY ./prisma . 

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["node", "dist/index.js"]
