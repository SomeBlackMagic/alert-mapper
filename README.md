# Alert Mapper
![Docker image](https://github.com/SomeBlackMagic/alert-mapper/actions/workflows/docker-image.yml/badge.svg)
[![Docker Pulls](https://img.shields.io/docker/pulls/someblackmagic/alert-mapper.svg)](https://store.docker.com/community/images/someblackmagic/alert-mapper)
[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/someblackmagic)](https://artifacthub.io/packages/search?repo=someblackmagic)


Alert Mapper is an agent for forward alert event from input to output driver.
There are two distinct types of plugins:

1. [Input Plugins](/docs/INPUTS.md) collect alert event and map into global alert standard
2. [Processor Plugins](/docs/PROCESSORS.md) transform, decorate, and/or filter alert (TODO)
3. [Output Plugins](/docs/OUTPUTS.md) write alert to various destinations

All plugins must be configured by environment variables.
