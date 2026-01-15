.POSIX:
.DELETE_ON_ERROR:

.PHONY: clean copy-assets build serve watch export-pdf all install docker-build docker-run help

RESUME_FILE := resume.json
ASSETS_DIR := src/assets
OUTPUT_DIR := output
TEMPLATE_DIR := src/template
THEME := jsonresume-theme-macchiato
TEMPLATE_FILE := $(TEMPLATE_DIR)/$(RESUME_FILE)
OUTPUT_TEMPLATE := $(OUTPUT_DIR)/$(RESUME_FILE)
OUTPUT_HTML := $(OUTPUT_DIR)/resume.html
OUTPUT_PDF := $(OUTPUT_DIR)/resume.pdf

clean:
	rm -f $(OUTPUT_DIR)/*

copy-assets:
	mkdir -p $(OUTPUT_DIR)
	[ -d $(ASSETS_DIR) ] && cp $(ASSETS_DIR)/* $(OUTPUT_DIR)/ || true

build: copy-assets
	pnpm run convert
	pnpm run build

serve: build
	pnpm run serve

watch:
	pnpm run watch

export-pdf: build
	OUTPUT_DIR=$(OUTPUT_DIR) ./scripts/export-pdf.sh

all: export-pdf

install:
	pnpm install

docker-build:
	docker build -f Dockerfile -t rcorreia-cv .

docker-run:
	docker run -d -v $$(pwd)/$(OUTPUT_DIR):/app/$(OUTPUT_DIR) -v $$(pwd)/src:/app/src rcorreia-cv

help:
	@echo "Available targets:"
	@echo "  clean          - Remove output directory contents"
	@echo "  copy-assets    - Copy assets to output directory"
	@echo "  build          - Build HTML resume (includes convert)"
	@echo "  serve          - Start local development server"
	@echo "  watch          - Watch for changes and rebuild"
	@echo "  export-pdf     - Export resume to PDF"
	@echo "  all            - Run all build tasks (build + export-pdf)"
	@echo "  install        - Install dependencies"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run Docker container (detached)"
	@echo "  help           - Show this help message"
