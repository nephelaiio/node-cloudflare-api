.PHONY: install lint eslint prettier format build esbuild package clean test

install:
	@npm ci 2>&1 >/dev/null

eslint: install
	@npx eslint . --ext .ts

prettier: install
	@npx prettier --check .

lint: eslint prettier

format: install
	@npx prettier --write .

build: install esbuild package

esbuild:
	npx ts-node esbuild.ts
	npx tsc --project tsconfig.json --emitDeclarationOnly

package:
	@cp package.json dist/

clean:
	@rm -rf dist/

test:
	npx vitest run
