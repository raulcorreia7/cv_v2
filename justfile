#!/usr/bin/env just --justfile

# theme
theme := "macchiato"

#files and folders
assets_fldr := "src/assets"
output_fldr := "output"
output_template := output_fldr / "resume.json"
output_html := output_fldr / "resume.html"
output_pdf := output_fldr / "resume.pdf"
# source template file
template_fldr := "src/template"
template_file := template_fldr / "resume.json"

# commands
res := "npx resumed"
hmr := "npx hackmyresume"
serve := "npx live-server"


default:
	@just --list

clean:
	rm {{output_fldr}}/*

base: create_output copy 

create_output:
	mkdir -p {{output_fldr}}

copy:
	cp {{assets_fldr}}/* {{output_fldr}}/

convert: base
	{{hmr}} convert {{template_file}} {{output_template}}

build: convert
	{{res}} {{output_template}} --theme {{theme}} -o {{output_html}}

serve: 
	{{serve}} --watch={{output_fldr}} --open={{output_html}}

watch:
	watchexec -w {{template_fldr}} just build

export-pdf:
	wkhtmltopdf -T 0 -B 0 -L 0 -R 0 --zoom 1.05 --enable-smart-shrinking --print-media-type --enable-local-file-access {{output_html}} {{output_pdf}}

all:build export-pdf

install:
	npm i -g pnpm
	pnpm i

install-prod:
	npm i -g pnpm
	pnpm i --prod

docker-build:
	docker build -f dockerfile.alpine . -t rcorreia-cv

docker-run:
	docker run -d -v $(pwd)/output:/app/output -v $(pwd)/src:/app/src rcorreia-cv