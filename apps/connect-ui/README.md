# connect-ui

Connect UI app.

## Development

```bash
# Copy env file first
cp apps/connect-ui/.env.example apps/connect-ui/.env

yarn nx dev connect-ui       # http://localhost:4500
yarn nx build connect-ui
yarn nx test connect-ui
yarn nx lint connect-ui
```

## Environment variables

| Variable          | Values            | Effect                                  |
| ----------------- | ----------------- | --------------------------------------- |
| `IS_MOCK_ENABLED` | `true` \| `false` | Use mock data instead of live API calls |
