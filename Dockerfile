FROM node:16.14.2-alpine
LABEL org.opencontainers.image.source https://github.com/vivedo/kacher

WORKDIR /app
COPY . ./

RUN npm ci --production

EXPOSE 8080
CMD ["npm", "start"]