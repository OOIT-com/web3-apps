# CRACO Setup Instructions

## Problem Analysis

The issue you're experiencing is likely due to dependency conflicts between:
1. `react-scripts` (which is required for the React app)
2. `@craco/craco` (which overrides react-scripts configuration)
3. Various peer dependencies from other packages

## Solution Approach

Since CRACO works by overriding react-scripts configuration, we need to ensure proper dependency resolution:

### 1. Clean Installation Approach
First, clean your node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 2. Alternative: Use npm-force-resolutions (if you're using npm 7+)
If you want to fix the specific version conflicts in your package.json, add this section:

```json
{
  "resolutions": {
    "typescript": "^4.9.5",
    "i18next": "^23.16.8"
  }
}
```

### 3. Or install with force flag:
```bash
npm install --force
```

## Testing Your Setup

After installation, test that everything works:

### Test build:
```bash
npm run build
```

### Test development server:
```bash
npm start
```

### Verify type checking:
```bash
npm run typecheck
```

## Expected Outcome

With the CRACO setup in place:
- All existing polyfills (crypto, stream, buffer) should work
- TypeScript 4.9.5 satisfies react-scripts 5.0.1's TypeScript peer dependency
- i18next packages should resolve without conflicts
- Application should build and run normally