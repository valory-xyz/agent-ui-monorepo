# Agents.fun UI

React application for Agents.fun UI, designed to be consumed by the agent and available in [Pearl](https://github.com/valory-xyz/olas-operate-app).

## 🧪 Mock Data
To mock, update the `IS_MOCK_ENABLED` in `.env` and the app will use the mock data instead of the API. 

## 🗜️ Zip locally

1. Run the build command: `yarn nx run agentsfun-ui:build`
2. Navigate to the build output directory: `cd dist/apps/agentsfun-ui`
3. Create a zip archive of the build artifacts: `zip -r ../../../agentsfun-ui-build.zip .`

## 📦 Release process

1. Bump the version in `package.json`
2. Push a new tag to the repository, (e.g., `v1.0.0-agentsfun`)
3. The CI will build and release the contents of the `dist/apps/agentsfun-ui` directory to a zip file.

## 🔐 Deployment expectations

This app ships as a static-asset ZIP attached to a GitHub Release. The downstream operator (typically the Pearl agent container) is responsible for runtime security headers. Recommended minimum set when serving the unpacked bundle:

| Header | Recommended value | Why |
| --- | --- | --- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://gateway.autonolas.tech; media-src 'self' https://gateway.autonolas.tech; font-src 'self' data:; connect-src 'self' http://127.0.0.1:8716; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'` | `'unsafe-inline'` for `style-src` is required by styled-components 5.x. IPFS gateway needs explicit `img-src` / `media-src` entries. Backend fetches go to `http://127.0.0.1:8716` via `LOCAL` (see [`libs/util-constants-and-types`](../../libs/util-constants-and-types/src/lib/constants/local.ts)). `frame-ancestors 'none'` blocks clickjacking and **only works as a header** (meta-tag is ignored). |
| `Strict-Transport-Security` | `max-age=31536000` | If served over HTTPS. |
| `X-Content-Type-Options` | `nosniff` | Disable MIME-type sniffing. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Disable browser features the app does not use. |

If the operator cannot set HTTP headers, an equivalent (weaker — no `frame-ancestors`) `<meta http-equiv="Content-Security-Policy">` can be injected into `index.html` post-build. See [`SUPPLY-CHAIN-SECURITY.md`](../../SUPPLY-CHAIN-SECURITY.md) for the threat model that drives these recommendations.
