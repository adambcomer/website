.PHONY: install dev build serve

install:
	npm install

dev:
	make -j 2 dev-tailwind dev-hugo

dev-tailwind:
	npm run tailwind:watch

dev-hugo:
	npm run hugo:watch
