# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```


# Troubleshooting

### On cloud can't run with serve

On GCP, If you run 

```bash
~/Repos/start-from-scratch/frontend$ npm install --global serve

changed 90 packages in 5s

24 packages are looking for funding
  run `npm fund` for details
```

it looks fine but

```bash
serve dist

Command 'serve' not found, but can be installed with:

snap install serve
Please ask your administrator.
```


```bash
npm root -g
/home/clouduser/.npm/lib/node_modules
echo 'export PATH=$PATH:$(npm bin -g)' >> ~/.bashrc
source ~/.bashrc
```


### However this command worked

```
~/Repos/start-from-scratch/frontend$ ~/.npm/bin/serve dist/
 ERROR  Cannot copy server address to clipboard: Couldn't find the `xsel` binary and fallback didn't work. On Debian/Ubuntu you can install xsel with: sudo apt install xsel.

   ┌────────────────────────────────────────┐
   │                                        │
   │   Serving!                             │
   │                                        │
   │   - Local:    http://localhost:3000    │
   │   - Network:  http://10.128.0.2:3000   │
   │                                        │
   └────────────────────────────────────────┘
```

Navigated to http://34.72.180.180:3000/ and was able to see the metamask frontend loading

