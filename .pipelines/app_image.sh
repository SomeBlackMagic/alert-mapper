#!/usr/bin/env bash
. .pipelines/vars_from_github_action.sh

################### APP IMAGES ###################

function docker_build_file_args1 () {
	echo CMD: docker build -t $1 -f $2 $3 .
	bash -c "docker build -t $1 -f $2 $3 ."
}


function build_base_image_app() {
    echo "$(tput bold)$(tput setb 4)$(tput setaf 3)$1$(tput sgr0)"
    IMAGE=$2
    DOCKER_FILE=$3
    export DOCKER_BUILDKIT=1
    docker_build_file_args1 ${IMAGE} ${DOCKER_FILE} "\
            --progress=plain \
            --build-arg DOCKER_SERVER_HOST=${DOCKER_SERVER_HOST} \
            --build-arg DOCKER_PROJECT_PATH=${DOCKER_PROJECT_PATH} \
            --build-arg DOCKER_NODE_VERSION=${DOCKER_NODE_VERSION} \
            --build-arg DOCKER_IMAGE_VERSION=${DOCKER_IMAGE_VERSION} \
    "
    export DOCKER_BUILDKIT=0
    #docker push ${IMAGE}
}

build_base_image_app "BUILD dev image" \
    "$DOCKER_SERVER_HOST/$DOCKER_PROJECT_PATH/app-dev:$DOCKER_IMAGE_VERSION" \
    .docker/app/dev.Dockerfile

build_base_image_app "BUILD prod image" \
    "$DOCKER_SERVER_HOST/$DOCKER_PROJECT_PATH/app-prod:$DOCKER_IMAGE_VERSION" \
    .docker/app/prod.Dockerfile

function build_app_image() {
    echo "$(tput bold)$(tput setb 4)$(tput setaf 3)$1$(tput sgr0)"
    IMAGE=$2
    DOCKER_FILE=$3
    docker_build_file_args1 ${IMAGE} ${DOCKER_FILE} "\
            --progress=plain \
            --build-arg DOCKER_SERVER_HOST=$DOCKER_SERVER_HOST \
            --build-arg DOCKER_PROJECT_PATH=$DOCKER_PROJECT_PATH \
            --build-arg DOCKER_NODE_VERSION=$DOCKER_NODE_VERSION \
            --build-arg DOCKER_IMAGE_VERSION=$DOCKER_IMAGE_VERSION \
    "
    docker push ${IMAGE}
}

build_base_image_app "BUILD app_test" \
    "$DOCKER_SERVER_HOST/$DOCKER_PROJECT_PATH-app_test:$DOCKER_IMAGE_VERSION" \
    .docker/app_test/Dockerfile

build_app_image "BUILD api" \
    "$DOCKER_SERVER_HOST/$DOCKER_PROJECT_PATH:$DOCKER_IMAGE_VERSION" \
    .docker/worker/Dockerfile

