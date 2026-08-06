.PHONY: install dev build serve sync-originals upload-images

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

IP ?=

sync-originals:
	rsync -avP --progress adambcomer@$(IP):~/personal/website/tools/images/originals/ ./tools/images/originals/

upload-images:
	rclone copy --header-upload='Cache-Control: public, max-age=31536000, immutable' $(DIR) r2images:com-adambcomer-images/$(DIR) -P
