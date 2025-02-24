# Modius UI

React application for Modius.
Served by the Modius agent, designed to be consumed by [Pearl](https://github.com/olas-operate-app).

## Development

1. Install via `yarn install`
2. Run via `yarn start`
3. Build for production via `yarn build`
    - `/build` is the output directory, and can be served statically

Mock portfolio data available in `usePortfolio` hook. Return `mockDatasource` in place of API response.

## Release process

1. Bump the version in `package.json`
2. Push a new tag to the repository
3. The CI will build and release the contents of the `build/` directory to a zip file.

## License
MIT
