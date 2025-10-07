
# set shell := ["sh", "-c"]

# Define variables for directories and files

resume_file := "resume.json"
assets_dir := "src/assets"
output_dir := "output"
template_dir := "src/template"
template_file := template_dir / resume_file
output_template := output_dir / resume_file
output_html := output_dir / "resume.html"
output_pdf := output_dir / "resume.pdf"
default_theme := "jsonresume-theme-macchiato"
sleek_theme := "src/theme/sleek/index.js"

# Define the default recipe to list available commands
default:
	@just --list

# Clean the output directory
clean:
	rm -f {{output_dir}}/*

# Create the output directory if it doesn't exist
create_output:
	mkdir -p {{output_dir}}

# Copy assets to the output directory
copy_assets: create_output
	cp {{assets_dir}}/* {{output_dir}}/

# Convert the template file to the output template
convert: copy_assets
	npx hackmyresume convert {{template_file}} {{output_template}}

# Build the HTML resume using the specified theme
build: convert
        npx resumed {{output_template}} --theme "{{default_theme}}" -o {{output_html}}

# Build the HTML resume using the sleek theme (optionally selecting a variant)
build-sleek variant="": convert
        @output_name="resume-sleek"; \
        if [ -n "{{variant}}" ]; then \
                output_name="resume-{{variant}}"; \
                npx resumed {{output_template}} --theme "$(pwd)/{{sleek_theme}}" \
                        --theme-options.variant "{{variant}}" \
                        -o {{output_dir}}/$$output_name.html; \
        else \
                npx resumed {{output_template}} --theme "$(pwd)/{{sleek_theme}}" \
                        -o {{output_dir}}/$$output_name.html; \
        fi

# Serve the output directory with live reload
serve:
	npx live-server --watch={{output_dir}} --open={{output_html}}

# Watch for changes in the template directory and rebuild
watch:
	watchexec -w {{template_dir}} just docker-run

# Export the HTML resume to PDF
export-pdf: build
	wkhtmltopdf -T 0 -B 0 -L 0 -R 0 --zoom 0.95 --enable-smart-shrinking --print-media-type --enable-local-file-access {{output_html}} {{output_pdf}}

# Build all available themes to HTML
build-themes: convert
        node scripts/build-themes.mjs

# Build and export the resume to PDF
all: export-pdf

# Install dependencies using pnpm
install:
	npm install -g pnpm
	pnpm install

# Install production dependencies using pnpm
install-prod:
	npm install -g pnpm
	pnpm install --prod

# Build the Docker image
docker-build:
	docker build -f dockerfile.alpine . -t rcorreia-cv

# Run the Docker container with volume mounts
docker-run:
	docker run -d \
		-v $(pwd)/output:/app/output \
		-v $(pwd)/src:/app/src \
		rcorreia-cv