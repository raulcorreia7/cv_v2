.POSIX:
.SUFFIXES:
.DELETE_ON_ERROR:
.DEFAULT_GOAL := help

.PHONY: all build ci clean cover-letter cover-letter-pdf dev help install pdf release resume serve stop

# Preserve shell environment overrides over values loaded from .env.
ENV_RESUME_FILE := $(if $(filter environment environment override,$(origin RESUME_FILE)),$(value RESUME_FILE))
ENV_ASSETS_DIR := $(if $(filter environment environment override,$(origin ASSETS_DIR)),$(value ASSETS_DIR))
ENV_RESUME_COLOR_VARIANT := $(if $(filter environment environment override,$(origin RESUME_COLOR_VARIANT)),$(value RESUME_COLOR_VARIANT))
ENV_OUTPUT_DIR := $(if $(filter environment environment override,$(origin OUTPUT_DIR)),$(value OUTPUT_DIR))
ENV_TEMPLATE_DIR := $(if $(filter environment environment override,$(origin TEMPLATE_DIR)),$(value TEMPLATE_DIR))
ENV_THEME := $(if $(filter environment environment override,$(origin THEME)),$(value THEME))
ENV_COVER_LETTER_FILE := $(if $(filter environment environment override,$(origin COVER_LETTER_FILE)),$(value COVER_LETTER_FILE))
ENV_OUTPUT_HTML := $(if $(filter environment environment override,$(origin OUTPUT_HTML)),$(value OUTPUT_HTML))
ENV_OUTPUT_PDF := $(if $(filter environment environment override,$(origin OUTPUT_PDF)),$(value OUTPUT_PDF))
ENV_OUTPUT_LETTER_HTML := $(if $(filter environment environment override,$(origin OUTPUT_LETTER_HTML)),$(value OUTPUT_LETTER_HTML))
ENV_OUTPUT_LETTER_PDF := $(if $(filter environment environment override,$(origin OUTPUT_LETTER_PDF)),$(value OUTPUT_LETTER_PDF))
ENV_PORT := $(if $(filter environment environment override,$(origin PORT)),$(value PORT))

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
OUTPUT_HTML ?= $(OUTPUT_DIR)/resume.html
OUTPUT_PDF ?= $(OUTPUT_DIR)/resume.pdf
OUTPUT_LETTER_HTML ?= $(OUTPUT_DIR)/cover-letter.html
OUTPUT_LETTER_PDF ?= $(OUTPUT_DIR)/cover-letter.pdf
PORT ?= 8080

ifneq ($(strip $(ENV_RESUME_FILE)),)
RESUME_FILE := $(ENV_RESUME_FILE)
endif
ifneq ($(strip $(ENV_ASSETS_DIR)),)
ASSETS_DIR := $(ENV_ASSETS_DIR)
endif
ifneq ($(strip $(ENV_RESUME_COLOR_VARIANT)),)
RESUME_COLOR_VARIANT := $(ENV_RESUME_COLOR_VARIANT)
endif
ifneq ($(strip $(ENV_OUTPUT_DIR)),)
OUTPUT_DIR := $(ENV_OUTPUT_DIR)
endif
ifneq ($(strip $(ENV_TEMPLATE_DIR)),)
TEMPLATE_DIR := $(ENV_TEMPLATE_DIR)
endif
ifneq ($(strip $(ENV_THEME)),)
THEME := $(ENV_THEME)
endif
ifneq ($(strip $(ENV_COVER_LETTER_FILE)),)
COVER_LETTER_FILE := $(ENV_COVER_LETTER_FILE)
endif
ifneq ($(strip $(ENV_OUTPUT_HTML)),)
OUTPUT_HTML := $(ENV_OUTPUT_HTML)
endif
ifneq ($(strip $(ENV_OUTPUT_PDF)),)
OUTPUT_PDF := $(ENV_OUTPUT_PDF)
endif
ifneq ($(strip $(ENV_OUTPUT_LETTER_HTML)),)
OUTPUT_LETTER_HTML := $(ENV_OUTPUT_LETTER_HTML)
endif
ifneq ($(strip $(ENV_OUTPUT_LETTER_PDF)),)
OUTPUT_LETTER_PDF := $(ENV_OUTPUT_LETTER_PDF)
endif
ifneq ($(strip $(ENV_PORT)),)
PORT := $(ENV_PORT)
endif

export ASSETS_DIR COVER_LETTER_FILE OUTPUT_DIR OUTPUT_HTML OUTPUT_LETTER_HTML OUTPUT_LETTER_PDF OUTPUT_PDF PORT RESUME_COLOR_VARIANT RESUME_FILE TEMPLATE_DIR THEME

clean:
	rm -rf "$(OUTPUT_DIR)"

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

release: OUTPUT_DIR=output
release: OUTPUT_HTML=$(OUTPUT_DIR)/resume.html
release: OUTPUT_PDF=$(OUTPUT_DIR)/resume.pdf
release: OUTPUT_LETTER_HTML=$(OUTPUT_DIR)/cover-letter.html
release: OUTPUT_LETTER_PDF=$(OUTPUT_DIR)/cover-letter.pdf
release: ci

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
	@echo "  build             Build resume and cover-letter HTML"
	@echo "  resume            Build the resume HTML only"
	@echo "  cover-letter      Build the cover-letter HTML only"
	@echo "  pdf               Build the resume PDF"
	@echo "  cover-letter-pdf  Build the cover-letter PDF"
	@echo "  all               Run the full local flow in the default output dir"
	@echo "  ci                Run the full local smoke-check"
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
