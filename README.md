# Agent UI monorepo

- This repository contains the source code for the Agent UI monorepo, which is a collection of web apps designed to provide a UI for various agent-based functionalities.
- List of apps:
  - BabyDegen UI (work in progress)
  - Predict UI (work in progress)
  - Agents.fun UI (work in progress)

# Commands 

- To run the development server for the monorepo, use:
  ```bash
  npx nx serve <app-name>
  ```
- To create an app in the monorepo, use:
  ```bash
  npx nx generate @nx/react:app <app-name>
  ```
- To create a library in the monorepo:
  - For a React library, use:
    ```bash
    npx nx generate @nx/react:lib <lib-name>
    ```
  - For a JavaScript library, use:
    ```bash
    npx nx generate @nx/js:lib <lib-name>
    ```
  and other documentation can be found in the [Nx documentation](https://nx.dev/features/generate-code#generate-code).
