FROM node:16.14.2-alpine AS build-environment
LABEL org.opencontainers.image.source https://github.com/vivedo/kacher

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

WORKDIR /app
COPY . /app

RUN npm ci --production

FROM gcr.io/distroless/nodejs:16 AS kacher-runner
COPY --from=build-environment /tini /tini

WORKDIR /app
COPY --from=build-environment /app /app

EXPOSE 8080
ENTRYPOINT ["/tini", "--", "/nodejs/bin/node"]
CMD ["./main.js"]