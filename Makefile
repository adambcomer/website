.PHONY: install dev build serve sync-originals upload-images convert-images

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

DIR ?=
DEST ?=
OUT ?= $(DEST)/photos.json
convert-images:
	./tools/images/img_conv.zsh "$(DIR)" "$(DEST)" "$(OUT)"

IP ?=
sync-originals:
	rsync -avP --progress ./tools/images/originals/ adambcomer@$(IP):~/personal/website/tools/images/originals/

upload-images:
	rclone copy -vP --header-upload='Cache-Control: public, max-age=31536000, immutable' ./tools/images/originals/ r2images:com-adambcomer-images/originals/
	rclone copy -vP --header-upload='Cache-Control: public, max-age=31536000, immutable' ./tools/images/web/ r2images:com-adambcomer-images/web/
