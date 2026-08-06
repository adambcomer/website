#!/bin/zsh
#
# Converts an image into the srcset/sources JSON fragment used by
# assets/photography/**/photos.json, writing resized jxl/avif/jpeg
# variants into DEST along the way.
#
# Usage: img_conv.zsh <image> <filename-slug> <dest-dir>

set -euo pipefail

if (( $# != 3 )); then
  echo "Usage: $0 <image> <filename-slug> <dest-dir>" >&2
  exit 1
fi

IMAGE=$1
FILENAME=$2
DEST=$3

for cmd in magick identify jq; do
  if ! command -v $cmd >/dev/null 2>&1; then
    echo "Error: required command '$cmd' not found" >&2
    exit 1
  fi
done

if [[ ! -f $IMAGE ]]; then
  echo "Error: input image '$IMAGE' not found" >&2
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

SRC=""
SRC_WIDTH=""
SRC_HEIGHT=""

SOURCES_JSON="[]"
for f in $FORMATS; do
  SRCSET_JSON="[]"
  for s in $SIZES; do
    TEMPFILE="$TMPDIR/temp.$f"

    magick "$IMAGE" -resize "${s}@" -auto-orient "$TEMPFILE"

    DIMENSIONS=$(identify -ping -format "%wx%h" "$TEMPFILE")
    WIDTH=$(identify -ping -format "%w" "$TEMPFILE")
    HEIGHT=$(identify -ping -format "%h" "$TEMPFILE")

    OUTPATH="${DEST}/${FILENAME}_${DIMENSIONS}.$f"
    mv "$TEMPFILE" "$OUTPATH"

    URL="${BASE_URL}/${OUTPATH} ${WIDTH}w"
    SRCSET_JSON=$(jq -c --arg url "$URL" '. + [$url]' <<<"$SRCSET_JSON")

    # Use the largest jpeg as the fallback `src`/dimensions.
    if [[ $f == jpeg && -z $SRC ]]; then
      SRC="${BASE_URL}/${OUTPATH}"
      SRC_WIDTH=$WIDTH
      SRC_HEIGHT=$HEIGHT
    fi
  done

  SOURCE_JSON=$(jq -n --arg type "image/${f}" --argjson srcset "$SRCSET_JSON" \
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
