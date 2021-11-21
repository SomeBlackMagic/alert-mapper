include .env

build:
	docker build .docker/node$(DOCKER_NODE_VERSION)-base/ \
		-t $(DOCKER_SERVER_HOST)/$(DOCKER_PROJECT_PATH)/node$(DOCKER_NODE_VERSION)-base:$(DOCKER_IMAGE_VERSION) \
		--build-arg DOCKER_SERVER_HOST=$(DOCKER_SERVER_HOST) \
		--build-arg DOCKER_PROJECT_PATH=$(DOCKER_PROJECT_PATH) \
		--build-arg DOCKER_NODE_VERSION=$(DOCKER_NODE_VERSION) \
		--build-arg DOCKER_IMAGE_VERSION=$(DOCKER_IMAGE_VERSION)
	docker build .docker/node$(DOCKER_NODE_VERSION)-yarn/ \
		-t $(DOCKER_SERVER_HOST)/$(DOCKER_PROJECT_PATH)/node$(DOCKER_NODE_VERSION)-yarn:$(DOCKER_IMAGE_VERSION) \
		--build-arg DOCKER_SERVER_HOST=$(DOCKER_SERVER_HOST) \
		--build-arg DOCKER_PROJECT_PATH=$(DOCKER_PROJECT_PATH) \
		--build-arg DOCKER_NODE_VERSION=$(DOCKER_NODE_VERSION) \
		--build-arg DOCKER_IMAGE_VERSION=$(DOCKER_IMAGE_VERSION)
	docker build .docker/node$(DOCKER_NODE_VERSION)-dev/ \
		-t $(DOCKER_SERVER_HOST)/$(DOCKER_PROJECT_PATH)/node$(DOCKER_NODE_VERSION)-dev:$(DOCKER_IMAGE_VERSION) \
		--build-arg DOCKER_SERVER_HOST=$(DOCKER_SERVER_HOST) \
		--build-arg DOCKER_PROJECT_PATH=$(DOCKER_PROJECT_PATH) \
		--build-arg DOCKER_NODE_VERSION=$(DOCKER_NODE_VERSION) \
		--build-arg DOCKER_IMAGE_VERSION=$(DOCKER_IMAGE_VERSION)
	docker-compose build --pull
down:
	docker-compose down
up:
	docker-compose up -d

db-recreate:
	make db-reset
	make db-migrate

db-migrate:
	docker-compose run --rm app sh -lc './node_modules/.bin/sequelize db:migrate'

db-reset:
	docker-compose run --rm app sh -lc './node_modules/.bin/sequelize db:migrate:undo:all'

db-seed:
	docker-compose run --rm app sh -lc './node_modules/.bin/sequelize db:seed:all'
