.PHONY: format
format:
	deno fmt

.PHONY: test
test:
	deno fmt --check
	deno lint
	deno test --allow-net --allow-env --check=all

.PHONY: publish
publish:
	git tag $(VERSION)
	deno run --allow-read --allow-write --allow-net --allow-run --allow-env build-npm.ts $(VERSION)
	cd npm && npm publish
	git push origin --tags

.PHONY: build-npm
build-npm:
	deno run --allow-read --allow-write --allow-net --allow-run --allow-env build-npm.ts 0.0.1
