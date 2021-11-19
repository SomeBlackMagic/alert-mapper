DOCKER_IMAGE_VERSION=$(echo ${GITHUB_REF} | sed -e "s/refs\/heads\///g")

if [ "${DOCKER_IMAGE_VERSION}" == "master" ]; then
  DOCKER_IMAGE_VERSION="latest"
fi;

# if contains /refs/tags/
if [ $(echo ${GITHUB_REF} | sed -e "s/refs\/tags\///g") != ${GITHUB_REF} ]; then
  DOCKER_IMAGE_VERSION="latest"
fi;
