set dotenv-load

image := "cv-v2"
port := env("PORT", "8080")
app := justfile_directory()
# deps and Chromium live in the image; the named volume seeds /app/node_modules from it
common := '-v "' + app + ':/app" -w /app -v cv-v2-node-modules:/app/node_modules -e RESUME_FILE -e ASSETS_DIR -e RESUME_COLOR_VARIANT -e OUTPUT_DIR -e TEMPLATE_DIR -e THEME -e COVER_LETTER_FILE -e PORT'

default:
    @just --list

# Build the dev image (bun + deps + chromium); host needs only just + docker
build-image:
    @docker build -q -t {{ image }} --target base . > /dev/null
    @echo "{{ image }} image ready"

alias install := build-image

[private]
run task extra="": build-image
    docker run --rm {{ common }} {{ extra }} {{ image }} bun scripts/run.ts {{ task }}

# Build the resume HTML
build: (run "build")

# Build the resume HTML only
resume: (run "build:resume")

# Build the cover-letter HTML only
cover-letter: (run "build:cover-letter")

# Build the resume PDF
pdf: (run "pdf")

# Export any HTML file or URL to PDF: just pdf-file src/resume.html tmp/out.pdf
pdf-file input="src/resume.html" output="tmp/resume-standalone.pdf": build-image
    docker run --rm {{ common }} -e PDF_INPUT={{ input }} -e PDF_OUTPUT={{ output }} {{ image }} bun scripts/export-pdf.ts

# Build the cover-letter PDF
cover-letter-pdf: (run "pdf:cover-letter")

# Run the primary local smoke-check
ci: (run "ci")

alias all := ci

# Build the release bundle in output/
release: (run "ci" "-e OUTPUT_DIR=output")

# Build once and serve the output
serve: build-image
    docker run --rm -i --name cv-serve {{ common }} -p {{ port }}:{{ port }} {{ image }} bun scripts/run.ts serve

# Build, serve, and live reload on changes
dev: build-image
    docker run --rm -i --name cv-dev {{ common }} -p {{ port }}:{{ port }} {{ image }} bun scripts/run.ts dev

# Stop the serve/dev container
stop:
    docker ps -q --filter "name=^cv-" | xargs -r docker stop

# Remove generated output (container artifacts are root-owned)
clean: build-image
    docker run --rm -v "{{ app }}:/app" -w /app {{ image }} rm -rf tmp output

# Shell inside the dev image for debugging
shell: build-image
    docker run --rm -it {{ common }} {{ image }} sh
