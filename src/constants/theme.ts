/**
 * Shared design tokens and component styles.
 * Import these in BOTH .tsx (phone) and .web.tsx (browser) files
 * so that a single change here applies everywhere.
 */

import { Platform, StyleSheet } from 'react-native';

// ─── Core Colour Palette ──────────────────────────────────────────────────────

export const Colors = {
  primary: '#208AEF',
  danger: '#ff4444',
  black: '#000000',
  white: '#ffffff',
  grey100: '#f0f0f0',
  grey300: '#cccccc',
  grey500: '#999999',
  grey700: '#555555',
  grey900: '#111111',
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ─── Typography ───────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ─── Shared Component Styles ──────────────────────────────────────────────────
// Edit these to change the look on BOTH phone and browser at the same time.

export const SearchBarStyles = StyleSheet.create({
  wrapper: {
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 14,
    paddingRight: 4,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 17,
    color: Colors.grey900,
    fontWeight: '500',
  },
  clearButton: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingRight: 14,
    paddingLeft: 4,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: Colors.black,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    maxHeight: 260,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.grey900,
    flex: 1,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.grey100,
    marginHorizontal: 14,
  },
});

export const CameraViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  statusTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusSubtitle: {
    color: Colors.grey500,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  hazardOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    gap: 8,
  },
  hazardText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
});

export const MapViewStyles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    gap: 12,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
    fontWeight: '600',
  },
  loadingText: {
    color: Colors.grey700,
    fontSize: 15,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
