const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// `.cjs` uzantısını desteklemesi için asset uzantılarına ekleme
config.resolver.assetExts.push("cjs");

// `unstable_enablePackageExports` özelliğini devre dışı bırakma
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
