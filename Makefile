.POSIX:
.SUFFIXES:
.DELETE_ON_ERROR:
.DEFAULT_GOAL := help

.PHONY: all build ci clean cover-letter cover-letter-pdf dev help install pdf release resume serve stop

-include .env

BUN ?= bun
PLAYWRIGHT ?= bunx playwright
RUNNER := $(BUN) scripts/run.ts

RESUME_FILE ?= resume.json
ASSETS_DIR ?= src/assets
RESUME_COLOR_VARIANT ?= slate-green
OUTPUT_DIR ?= tmp
TEMPLATE_DIR ?= src/template
THEME ?= jsonresume-theme-macchiato
COVER_LETTER_FILE ?= $(TEMPLATE_DIR)/cover-letter.json
PORT ?= 8080

export ASSETS_DIR COVER_LETTER_FILE OUTPUT_DIR PORT RESUME_COLOR_VARIANT RESUME_FILE TEMPLATE_DIR THEME

clean:
	rm -rf "$(OUTPUT_DIR)" output

install:
	$(BUN) install
	$(PLAYWRIGHT) install chromium

build:
	$(RUNNER) build

resume:
	$(RUNNER) build:resume

cover-letter:
	$(RUNNER) build:cover-letter

pdf:
	$(RUNNER) pdf

cover-letter-pdf:
	$(RUNNER) pdf:cover-letter

all: ci

release:
	OUTPUT_DIR=output $(RUNNER) ci

serve:
	$(RUNNER) serve

dev:
	$(RUNNER) dev

stop:
	$(RUNNER) stop

ci:
	$(RUNNER) ci

help:
	@echo ""
	@echo "Setup"
	@echo "  install           Install Bun dependencies and Chromium"
	@echo ""
	@echo "Primary"
	@echo "  build             Build the resume HTML"
	@echo "  resume            Build the resume HTML only"
	@echo "  cover-letter      Build the cover-letter HTML only"
	@echo "  pdf               Build the resume PDF"
	@echo "  cover-letter-pdf  Build the cover-letter PDF"
	@echo "  all               Build the primary resume bundle"
	@echo "  ci                Run the primary local smoke-check"
	@echo "  release           Build the release bundle in output/"
	@echo ""
	@echo "Palette"
	@echo "  RESUME_COLOR_VARIANT=<name> make build"
	@echo ""
	@echo "Development"
	@echo "  serve             Build once and serve the output"
	@echo "  dev               Build, serve, and live reload on changes"
	@echo "  stop              Stop the local Bun server"
	@echo ""
	@echo "Maintenance"
	@echo "  clean             Remove generated output"
