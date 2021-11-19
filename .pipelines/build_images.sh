#!/usr/bin/env bash
. .pipelines/vars_from_github_action.sh

function docker_build_dir1 () {
	if [ -z "$3" ]; then
		echo CMD: docker build -t $1 .
		pushd $2 && docker build -t $1 . && popd
	else
		echo CMD: docker build -t $1 --build-arg CI_COMMIT_REF_SLUG=$3 .
		pushd $2 && docker build -t $1 --build-arg CI_COMMIT_REF_SLUG=$3 . && popd
	fi
}


function build_base_image() {
    echo "$(tput bold)$(tput setb 4)$(tput setaf 3)$1$(tput sgr0)"
    IMAGE=$2
    DOCKER_PATH=$3
    docker_build_dir1 \
        ${IMAGE} \
        ${DOCKER_PATH} \
        "\
            --build-arg DOCKER_SERVER_HOST=$DOCKER_SERVER_HOST \
            --build-arg DOCKER_PROJECT_PATH=$DOCKER_PROJECT_PATH \
            --build-arg DOCKER_NODE_VERSION=$DOCKER_NODE_VERSION \
            --build-arg DOCKER_IMAGE_VERSION=$DOCKER_IMAGE_VERSION \
        "
    #docker push ${IMAGE}
}


build_base_image "BUILD node-base" \
    "$DOCKER_SERVER_HOST/$DOCKER_PROJECT_PATH/node${DOCKER_NODE_VERSION}-base:$DOCKER_IMAGE_VERSION" \
    ".docker/node${DOCKER_NODE_VERSION}-base/"

build_base_image "BUILD node-yarn" \
    "$DOCKER_SERVER_HOST/$DOCKER_PROJECT_PATH/node${DOCKER_NODE_VERSION}-yarn:$DOCKER_IMAGE_VERSION" \
    ".docker/node${DOCKER_NODE_VERSION}-yarn/"


