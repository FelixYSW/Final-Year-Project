/**
 * Custom Expo config plugin: withGoogleMapsInit
 *
 * expo prebuild regenerates ios/ from scratch on every CI build.
 * react-native-maps' own plugin only patches the ObjC AppDelegate,
 * not the Swift one that Expo SDK 50+ generates.
 *
 * This plugin patches AppDelegate.swift to call
 * GMSServices.provideAPIKey() before React Native starts, which is
 * required for PROVIDER_GOOGLE to render on iOS.
 */

const { withAppDelegate } = require('@expo/config-plugins');

const withGoogleMapsInit = (config) => {
  return withAppDelegate(config, (mod) => {
    let contents = mod.modResults.contents;

    // Only patch Swift AppDelegate (not ObjC .mm files)
    if (!mod.modResults.language === 'swift' && !contents.includes('import ExpoModulesCore') && !contents.includes('ExpoAppDelegate')) {
      return mod;
    }

    // Don't double-patch
    if (contents.includes('GMSServices.provideAPIKey')) {
      return mod;
    }

    // Read the API key from app config (set via app.json ios.config.googleMapsApiKey)
    const apiKey =
      config.ios?.config?.googleMapsApiKey ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '';

    if (!apiKey) {
      console.warn('[withGoogleMapsInit] No Google Maps API key found. Map will be black.');
      return mod;
    }

    // 1. Add the import after existing imports
    contents = contents.replace(
      'import ReactAppDependencyProvider',
      'import ReactAppDependencyProvider\nimport GoogleMaps'
    );

    // 2. Inject the GMSServices call as the very first line inside didFinishLaunchingWithOptions
    //    We look for the opening of the function body (the line after the `-> Bool {`)
    contents = contents.replace(
      /(\) -> Bool \{\n)/,
      `$1    GMSServices.provideAPIKey("${apiKey}")\n`
    );

    mod.modResults.contents = contents;
    return mod;
  });
};

module.exports = withGoogleMapsInit;
