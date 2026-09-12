set dotenv-load

image := "cv-v2"
port := env("PORT", "8080")
app := justfile_directory()
common := '-v "' + app + ':/app" -w /app -v /app/node_modules'

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

# Check the TypeScript document contracts and build scripts
typecheck: (run "bun run typecheck")

# Render the structured document sources to self-contained HTML
render: (run "bun run typecheck && bun scripts/render-documents.ts")

# Render the typed sources and export tmp/resume.pdf (runs all checks first)
pdf: (run "bun run typecheck && bun scripts/render-documents.ts && bun scripts/check-copy.ts && bun scripts/check-layout.ts && bun scripts/export-pdf.ts")

# Run the copy check on both documents
check: (run "bun run typecheck && bun scripts/render-documents.ts && bun scripts/check-copy.ts && bun scripts/check-layout.ts")

# Single-column PDF for portals that parse the CV (no interleaved columns)
pdf-ats: (run "bun run typecheck && bun scripts/render-documents.ts && PDF_ATS=1 PDF_OUTPUT=tmp/resume-ats.pdf bun scripts/export-pdf.ts")

# Report which of a posting's terms are missing from the CV
coverage file: build-image
    docker run --rm {{ common }} -v "{{ file }}:/posting:ro" {{ image }} sh -c "bun run typecheck && bun scripts/render-documents.ts && bun scripts/check-coverage.ts /posting"

# Copy the structured sources and render a per-application working set
tailor slug: build-image
    docker run --rm {{ common }} {{ image }} sh -c "bun run typecheck && bun scripts/render-documents.ts && mkdir -p tmp/applications/{{ slug }} && cp tmp/resume.json tmp/cover-letter.json tmp/applications/{{ slug }}/ && RESUME_DATA=tmp/applications/{{ slug }}/resume.json COVER_LETTER_DATA=tmp/applications/{{ slug }}/cover-letter.json DOCUMENT_OUTPUT_DIR=tmp/applications/{{ slug }} bun scripts/render-documents.ts && ls -1 tmp/applications/{{ slug }}/"
    @echo "Edit the JSON files in tmp/applications/{{ slug }}/, then run:"
    @echo "  just render-application {{ slug }}"
    @echo "  just pdf-file tmp/applications/{{ slug }}/resume.html tmp/applications/{{ slug }}/resume.pdf"

# Rerender a tailored application's JSON sources
render-application slug: build-image
    docker run --rm {{ common }} -e RESUME_DATA=tmp/applications/{{ slug }}/resume.json -e COVER_LETTER_DATA=tmp/applications/{{ slug }}/cover-letter.json -e DOCUMENT_OUTPUT_DIR=tmp/applications/{{ slug }} {{ image }} sh -c "bun run typecheck && bun scripts/render-documents.ts"

# Render the typed sources and export tmp/cover-letter.pdf
cover-letter-pdf: (run "bun run typecheck && bun scripts/render-documents.ts && PDF_INPUT=tmp/cover-letter.html PDF_OUTPUT=tmp/cover-letter.pdf bun scripts/export-pdf.ts")

# Export any HTML file or URL: just pdf-file tmp/resume.html tmp/out.pdf
pdf-file input="tmp/resume.html" output="tmp/out.pdf": build-image
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
