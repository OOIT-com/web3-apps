# Installation and Testing Instructions

## 1. Install Dependencies

Run the following command to install all dependencies with the new CRACO setup:

```bash
npm install
```

This will:
- Install CRACO as a dev dependency
- Install TypeScript 4.9.5, which is compatible with react-scripts 5.0.1
- Install updated i18next packages
- Remove react-app-rewired dependency

## 2. Build the Application

To verify everything works correctly:

```bash
npm run build
```

This should complete successfully with no errors.

## 3. Test the Application

To start the development server and test functionality:

```bash
npm start
```

## 4. Testing Polyfills

To verify that all your polyfills are working correctly, you can:

### Check browser console for any errors:
- Open browser developer tools (F12)
- Look for any "ReferenceError" or "Module not found" errors
- Verify that crypto, stream, buffer, and other modules work as expected

### Test specific functionality:
- Navigate to pages that use crypto-browserify (like the polygon-get-balance.ts file)
- Ensure the balance fetching works without polyfill-related errors
- Test any file handling features that rely on browser polyfills

## 5. Verify TypeScript Compatibility

Run type checking:

```bash
npm run typecheck
```

This should complete successfully with no TypeScript errors.

## Expected Results

After successful installation and testing, you should see:
- No dependency resolution errors
- Successful build process
- No runtime errors related to polyfills
- Working application with all existing features intact