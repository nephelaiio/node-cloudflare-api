.PHONY: install lint eslint prettier format built test

install:
	npm ci

eslint: install
	npx eslint . --ext .ts

prettier: install
	npx prettier --check .

lint: eslint prettier

format: install
	npx prettier --write .

build: install
	npx ts-node esbuild.ts
	npx tsc --project tsconfig.json --emitDeclarationOnly
	cp package.json dist/

test:
	npx vitest run
