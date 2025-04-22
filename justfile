
# set shell := ["sh", "-c"]

# Define variables for directories and files
assets_dir := "src/assets"
output_dir := "output"
template_dir := "src/template"
template_file := template_dir / "resume.json"
output_template := output_dir / "resume.json"
output_html := output_dir / "resume.html"
output_pdf := output_dir / "resume.pdf"
theme := "macchiato"

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
	npx resumed {{output_template}} --theme {{theme}} -o {{output_html}}

# Serve the output directory with live reload
serve:
	npx live-server --watch={{output_dir}} --open={{output_html}}

# Watch for changes in the template directory and rebuild
watch:
	watchexec -w {{template_file}} just docker-run

# Export the HTML resume to PDF
export_pdf: build
	wkhtmltopdf -T 0 -B 0 --enable-local-file-access {{output_html}} {{output_pdf}}

# Build and export the resume to PDF
all: export_pdf

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