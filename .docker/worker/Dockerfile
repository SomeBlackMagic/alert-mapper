ARG DOCKER_IMAGE_VERSION=master
ARG DOCKER_SERVER_HOST
ARG DOCKER_PROJECT_PATH
ARG DOCKER_NODE_VERSION

FROM ${DOCKER_SERVER_HOST}/${DOCKER_PROJECT_PATH}/app-prod:${DOCKER_IMAGE_VERSION} AS app
FROM ${DOCKER_SERVER_HOST}/${DOCKER_PROJECT_PATH}/node${DOCKER_NODE_VERSION}-base:${DOCKER_IMAGE_VERSION}

COPY --from=app /app /app

###
### Envs
###
ENV MY_USER="app" \
    MY_GROUP="app" \
    MY_UID="1000" \
    MY_GID="1000"

####
#### User/Group
####
RUN set -eux \
    && addgroup -g ${MY_GID} ${MY_GROUP} \
    && adduser -u ${MY_UID} -G ${MY_GROUP} -s /bin/bash -D ${MY_USER}


USER app

WORKDIR /app

STOPSIGNAL SIGINT

ENV NODE_OPTIONS="--enable-source-maps -r tsconfig-paths/register"
CMD ["node", "src/index.js"]
