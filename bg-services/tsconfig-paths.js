const path = require('path');
const fs = require('fs');

// Get the absolute path to the tsconfig.json file
const tsconfigPath = path.resolve(__dirname, './tsconfig.json');

let tsConfig = { compilerOptions: { paths: {} } };
try {
  if (fs.existsSync(tsconfigPath)) {
    tsConfig = require(tsconfigPath);
  } else {
    console.warn('tsconfig.json not found at', tsconfigPath);
  }
} catch (error) {
  console.error('Error loading tsconfig.json:', error.message);
}

const tsConfigPaths = require('tsconfig-paths');

const baseUrl = './dist';
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions?.paths || {},
});

// When path registration is no longer needed
// cleanup();
