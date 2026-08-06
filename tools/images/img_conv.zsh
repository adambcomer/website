#!/bin/zsh
#
# Converts every image in DIR into resized jxl/avif/jpeg variants written
# into DEST, and collects the per-image srcset/sources JSON fragments used
# by assets/photography/**/photos.json into a single JSON array at OUT
# (header/subheader/alt still need manual fill-in).
#
# Usage: img_conv.zsh <dir> <dest-dir> <out-json>

set -euo pipefail

if (( $# != 3 )); then
  echo "Usage: $0 <dir> <dest-dir> <out-json>" >&2
  exit 1
fi

DIR=$1
DEST=$2
OUT=$3

for cmd in magick identify jq; do
  if ! command -v $cmd >/dev/null 2>&1; then
    echo "Error: required command '$cmd' not found" >&2
    exit 1
  fi
done

if [[ ! -d $DIR ]]; then
  echo "Error: input directory '$DIR' not found" >&2
  exit 1
fi

mkdir -p "$DEST"

BASE_URL="https://images.adambcomer.com"

# Image sizes in Megapixels, largest first
SIZES=(8294400 3686400 2073600 921600 518400 230400)

# Image formats
FORMATS=(jxl avif jpeg)

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

convert_image() {
  local IMAGE=$1
  local FILENAME=$2

  local SRC=""
  local SRC_WIDTH=""
  local SRC_HEIGHT=""

  local SOURCES_JSON="[]"
  for f in $FORMATS; do
    local SRCSET_JSON="[]"
    for s in $SIZES; do
      local TEMPFILE="$TMPDIR/temp.$f"

      magick "$IMAGE" -resize "${s}@" -auto-orient "$TEMPFILE"

      local DIMENSIONS=$(identify -ping -format "%wx%h" "$TEMPFILE")
      local WIDTH=$(identify -ping -format "%w" "$TEMPFILE")
      local HEIGHT=$(identify -ping -format "%h" "$TEMPFILE")

      local OUTPATH="${DEST}/${FILENAME}_${DIMENSIONS}.$f"
      mv "$TEMPFILE" "$OUTPATH"

      local URL="${BASE_URL}/${OUTPATH} ${WIDTH}w"
      SRCSET_JSON=$(jq -c --arg url "$URL" '. + [$url]' <<<"$SRCSET_JSON")

      # Use the largest jpeg as the fallback `src`/dimensions.
      if [[ $f == jpeg && -z $SRC ]]; then
        SRC="${BASE_URL}/${OUTPATH}"
        SRC_WIDTH=$WIDTH
        SRC_HEIGHT=$HEIGHT
      fi
    done

    local SOURCE_JSON=$(jq -n --arg type "image/${f}" --argjson srcset "$SRCSET_JSON" \
      '{type: $type, srcset: $srcset}')
    SOURCES_JSON=$(jq -c --argjson source "$SOURCE_JSON" '. + [$source]' <<<"$SOURCES_JSON")
  done

  jq -n \
    --arg path "$FILENAME" \
    --arg src "$SRC" \
    --argjson srcWidth "$SRC_WIDTH" \
    --argjson srcHeight "$SRC_HEIGHT" \
    --argjson sources "$SOURCES_JSON" \
    '{
      path: $path,
      header: "",
      subheader: "",
      src: $src,
      srcWidth: $srcWidth,
      srcHeight: $srcHeight,
      alt: "",
      sources: $sources
    }'
}

PHOTOS_JSON="[]"
for IMAGE in "$DIR"/*.(jpg|jpeg|png|JPG|JPEG|PNG)(N); do
  FILENAME=${${IMAGE:t}:r}
  echo "Converting $IMAGE -> $FILENAME" >&2

  PHOTO_JSON=$(convert_image "$IMAGE" "$FILENAME")
  PHOTOS_JSON=$(jq -c --argjson photo "$PHOTO_JSON" '. + [$photo]' <<<"$PHOTOS_JSON")
done

jq '.' <<<"$PHOTOS_JSON" >"$OUT"
echo "Wrote $OUT" >&2
