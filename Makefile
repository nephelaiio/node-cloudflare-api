.PHONY: install lint eslint prettier format build esbuild package clean test

ENVFILE = ./.env

ifneq (,$(wildcard ${ENVFILE}))
    include ${ENVFILE}
    export
endif

install:
	@bun install 2>&1 >/dev/null

eslint: install
	@bun eslint . --ext .ts

prettier: install
	@bunx prettier --check .

lint: eslint prettier

format: install
	@bunx prettier --write .

build: install bundle

bundle:
	bun build ${SOURCE} --outfile ${BUNDLE} --external '@nephelaiio/logger'
	bunx tsc --project tsconfig.json --emitDeclarationOnly --outFile ${BUNDLE}
	cp package.json dist/

clean:
	@rm -rf $$(dirname ${BUNDLE})

test:
	bun test
