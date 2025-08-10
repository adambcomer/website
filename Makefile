.PHONY: install dev build serve

install:
	npm install

dev:
	npm run dev

build:
	npm run build

serve: build
	npx serve public

clean:
	rm -rf public
	rm -rf resources
