/**
 * Custom Expo config plugin: withGoogleMapsInit
 *
 * expo prebuild regenerates ios/ from scratch on every CI build.
 * react-native-maps' own plugin only patches the ObjC AppDelegate,
 * not the Swift one that Expo SDK 50+ generates.
 *
 * Strategy:
 *  1. Add `#import <GoogleMaps/GoogleMaps.h>` to the Objective-C
 *     bridging header so GMSServices is visible to Swift without
 *     needing `import GoogleMaps` (which fails — it's an ObjC framework).
 *  2. Inject `GMSServices.provideAPIKey("…")` into AppDelegate.swift
 *     as the first statement in didFinishLaunchingWithOptions.
 */

const { withAppDelegate, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// ── Step 1: patch the bridging header ────────────────────────────────────────
const withGoogleMapsBridgingHeader = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (mod) => {
      const projectRoot = mod.modRequest.projectRoot;
      const platformRoot = mod.modRequest.platformProjectRoot; // …/ios

      // Expo names the bridging header after the app slug
      const slug = config.slug ?? 'accessiblenavapp';
      const headerName = `${slug}-Bridging-Header.h`;
      const headerPath = path.join(platformRoot, slug, headerName);

      if (!fs.existsSync(headerPath)) {
        console.warn(`[withGoogleMapsInit] Bridging header not found at ${headerPath}, skipping.`);
        return mod;
      }

      let contents = fs.readFileSync(headerPath, 'utf8');

      if (!contents.includes('<GoogleMaps/GoogleMaps.h>')) {
        contents = `#import <GoogleMaps/GoogleMaps.h>\n${contents}`;
        fs.writeFileSync(headerPath, contents, 'utf8');
        console.log('[withGoogleMapsInit] Patched bridging header with GoogleMaps import.');
      }

      return mod;
    },
  ]);
};

// ── Step 2: patch AppDelegate.swift ──────────────────────────────────────────
const withGoogleMapsAppDelegate = (config) => {
  return withAppDelegate(config, (mod) => {
    let contents = mod.modResults.contents;

    // Only touch Swift AppDelegate
    if (!contents.includes('ExpoAppDelegate')) {
      return mod;
    }

    // Don't double-patch
    if (contents.includes('GMSServices.provideAPIKey')) {
      return mod;
    }

    const apiKey =
      config.ios?.config?.googleMapsApiKey ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '';

    if (!apiKey) {
      console.warn('[withGoogleMapsInit] No Google Maps API key found. Map will be black.');
      return mod;
    }

    // Inject GMSServices call as the first line inside didFinishLaunchingWithOptions.
    // We match the `-> Bool {` that closes the function signature and insert after it.
    contents = contents.replace(
      /(\) -> Bool \{\n)/,
      `$1    GMSServices.provideAPIKey("${apiKey}")\n`
    );

    mod.modResults.contents = contents;
    return mod;
  });
};

// ── Compose both patches ──────────────────────────────────────────────────────
const withGoogleMapsInit = (config) => {
  config = withGoogleMapsBridgingHeader(config);
  config = withGoogleMapsAppDelegate(config);
  return config;
};

module.exports = withGoogleMapsInit;
