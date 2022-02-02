DOCKER_PUSH_TO_REGISTRY=false
if [ ${GITHUB_REF_TYPE} == "branch" ]; then
  if [ ${GITHUB_REF_NAME} == "master" ] || [ ${GITHUB_REF_NAME} == "main" ]; then
    DOCKER_IMAGE_VERSION=latest
    DOCKER_PUSH_TO_REGISTRY=true
  else
    DOCKER_IMAGE_VERSION=${GITHUB_REF_NAME}
  fi;
elif [ ${GITHUB_REF_TYPE} == "tag" ]; then
    DOCKER_IMAGE_VERSION=${GITHUB_REF_NAME}
    DOCKER_PUSH_TO_REGISTRY=true
fi;
