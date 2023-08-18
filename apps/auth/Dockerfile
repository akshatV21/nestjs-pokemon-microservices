FROM node:19-alpine as development

WORKDIR /app

COPY /package*.json .
RUN npm install

COPY . .
RUN npm run build

FROM node:19-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=development ./app/dist ./dist

RUN ls /dist

RUN ls /dist/apps

RUN ls /dist/apps/auth

CMD ["node", "dist/apps/auth/main.js"]