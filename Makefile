.PHONY: check fix

check:
	@echo "==> ESLint"
	pnpm lint
	@echo "==> Prettier (check)"
	pnpm format:check

fix:
	@echo "==> Prettier (write)"
	pnpm format
	@echo "==> ESLint (fix)"
	pnpm eslint --fix .
