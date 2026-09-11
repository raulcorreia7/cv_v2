set dotenv-load

image := "cv-v2"
port := env("PORT", "8080")
app := justfile_directory()
common := '-v "' + app + ':/app" -w /app -v cv-v2-node-modules:/app/node_modules'

default:
    @just --list

# Build the dev image (bun + playwright + chromium); host needs only just + docker
build-image:
    @docker build -q -t {{ image }} --target base . > /dev/null
    @echo "{{ image }} image ready"

alias install := build-image

[private]
run cmd: build-image
    docker run --rm {{ common }} {{ image }} sh -c "{{ cmd }}"

# Export src/resume.html to tmp/resume.pdf
pdf: (run "bun scripts/export-pdf.ts")

# Export src/cover-letter.html to tmp/cover-letter.pdf
cover-letter-pdf: (run "PDF_INPUT=src/cover-letter.html PDF_OUTPUT=tmp/cover-letter.pdf bun scripts/export-pdf.ts")

# Export any HTML file or URL: just pdf-file src/resume.html tmp/out.pdf
pdf-file input="src/resume.html" output="tmp/out.pdf": build-image
    docker run --rm {{ common }} -e PDF_INPUT={{ input }} -e PDF_OUTPUT={{ output }} {{ image }} bun scripts/export-pdf.ts

# Assemble the publishable site in output/
site: (run "bun scripts/build-site.ts")

alias ci := site

# Preview the documents and the assembled site on http://localhost:8080
serve: build-image
    docker run --rm -i --name cv-serve {{ common }} -p {{ port }}:{{ port }} -e PORT {{ image }} bun scripts/serve.ts

# Stop the preview container
stop:
    docker ps -q --filter "name=^cv-" | xargs -r docker stop

# Remove generated output (container artifacts are root-owned)
clean: build-image
    docker run --rm -v "{{ app }}:/app" -w /app {{ image }} rm -rf tmp output

# Shell inside the image for debugging
shell: build-image
    docker run --rm -it {{ common }} {{ image }} sh
