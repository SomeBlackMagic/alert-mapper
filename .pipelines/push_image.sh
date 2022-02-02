#!/usr/bin/env bash
. .pipelines/vars_from_github_action.sh

################### APP IMAGES ###################

function push_image() {
    echo "$(tput bold)$(tput setb 4)$(tput setaf 3)$1$(tput sgr0)"
    IMAGE=$2
    if [ "${DOCKER_PUSH_TO_REGISTRY}" == true ]; then
      docker push ${IMAGE}
    else
      echo "[PUSH] - skip this step for image ${IMAGE}"
    fi;
}

push_image "push api" "$DOCKER_SERVER_HOST/$DOCKER_PROJECT_PATH:$DOCKER_IMAGE_VERSION"

