[![License: {{PKG_LICENSE}}](https://img.shields.io/badge/License-{{PKG_LICENSE}}-yellow.svg)](LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
{{GITHUB_ACTIONS_BADGES}}

# {{PKG_NAME}}

{{PKG_DESCRIPTION}}

## Install and use

`{{PKG_NAME}}` can be imported to your project with `npm`:

```console
npm install {{PKG_NAME}}
```

Then either require (Node.js CJS):

```javascript
const {{PKG_CAMELCASE}} = require('{{PKG_NAME}}')
```

or import (JavaScript ES module):

```javascript
import * as {{PKG_CAMELCASE}} from '{{PKG_NAME}}'
```

> The appropriate version for browser or node should be automatically chosen when importing. However, if your bundler does not import the appropriate module version (node esm, node cjs or browser esm), you can force it to use a specific one by just importing one of the followings:
>
> - `{{PKG_NAME}}/dist/cjs/index.node`: for Node.js CJS module
> - `{{PKG_NAME}}/dist/esm/index.node`: for Node.js ESM module
> - `{{PKG_NAME}}/dist/esm/index.browser`: for browser ESM module
>
> If you are coding TypeScript, types will not be automatically detected when using the specific versions. You can easily get the types in by creating adding to a types declaration file (`.d.ts`) the following line:
>
> ```typescript
> declare module '{{PKG_NAME}}/dist/esm/index.browser' // use the specific file you were importing
> ```

You can also download the {{IIFE_BUNDLE}}, the {{ESM_BUNDLE}} or the {{UMD_BUNDLE}} and manually add it to your project, or, if you have already installed `{{PKG_NAME}}` in your project, just get the bundles from `node_modules/{{PKG_NAME}}/dist/bundles/`.

## Usage example

```typescript
YOUR TYPESCRIPT EXAMPLE CODE HERE
```

## API reference documentation

[Check the API](../../docs/API.md)
