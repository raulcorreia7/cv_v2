#!/bin/sh

set -eu

OUTPUT_DIR="${OUTPUT_DIR:-output}"
OUTPUT_HTML="${OUTPUT_HTML:-${OUTPUT_DIR}/resume.html}"
OUTPUT_PDF="${OUTPUT_PDF:-${OUTPUT_DIR}/resume.pdf}"

if ! command -v wkhtmltopdf >/dev/null 2>&1; then
	echo "Error: wkhtmltopdf is not installed" >&2
	exit 1
fi

if [ ! -f "${OUTPUT_HTML}" ]; then
	echo "Error: ${OUTPUT_HTML} does not exist. Run 'make build' first." >&2
	exit 1
fi

wkhtmltopdf \
	-T 0 -B 0 -L 0 -R 0 \
	--zoom 0.95 \
	--enable-smart-shrinking \
	--print-media-type \
	--enable-local-file-access \
	"${OUTPUT_HTML}" "${OUTPUT_PDF}"
