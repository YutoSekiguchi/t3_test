start-dev:
	docker-compose -f docker-compose.dev.yml up --build -d

down-dev:
	docker-compose -f docker-compose.dev.yml down --rmi all