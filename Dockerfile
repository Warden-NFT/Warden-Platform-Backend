FROM node:lts AS build

WORKDIR /usr/src/app

# Install dependencies
COPY ["package.json", "yarn.lock", "./"]
RUN yarn

# Build the app
COPY . .
RUN yarn build

FROM node:lts

ENV NODE_ENV production
WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "./"]
RUN yarn

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD yarn start:prod
