#!/usr/bin/env just --justfile

# theme
theme := "macchiato"

#files and folders
assets_fldr := "assets"
output_fldr := "output"
output_template := output_fldr / "resume.json"
output_html := output_fldr / "resume.html"
# source template file
template_fldr := "template"
template_file := template_fldr / "resume.json"

# commands
res := "npx resumed"
hmr := "npx hackmyresume"
serve := "npx live-server"



default: create_output copy 
create_output:
	mkdir -p {{output_fldr}}
copy:
	cp {{assets_fldr}}/* {{output_fldr}}/

convert: default
	{{hmr}} convert {{template_file}} {{output_template}}


build: convert
	{{res}} {{output_template}} --theme {{theme}} -o {{output_html}}

serve: 
	{{serve}} --watch={{output_fldr}} --entry-file={{output_html}}

watch:
	watchexec -w {{template_fldr}} just build