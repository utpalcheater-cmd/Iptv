/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#1f2b40',
    tint: '#e26841',
    background: '#f5f2ed',
    foreground: '#1f2b40',
    card: '#fcfbf8',
    cardForeground: '#1f2b40',
    primary: '#e26841',
    primaryForeground: '#fffaf3',
    secondary: '#e6eee9',
    secondaryForeground: '#25433e',
    muted: '#ebe8e2',
    mutedForeground: '#75808d',
    accent: '#f6d15a',
    accentForeground: '#394029',
    destructive: '#c94d4d',
    destructiveForeground: '#fffaf3',
    border: '#ddd8cf',
    input: '#d6d0c7',
    sidebar: '#1c2940',
    sidebarForeground: '#f3efe8',
    sidebarAccent: '#293b57',
    success: '#65b99c',
    coralSoft: '#f8e2d7',
    cyanSoft: '#d9eceb',
    amberSoft: '#fbefc3',
  },
  dark: {
    text: '#f3efe8',
    tint: '#ef7952',
    background: '#131d2c',
    foreground: '#f3efe8',
    card: '#1c2940',
    cardForeground: '#f3efe8',
    primary: '#ef7952',
    primaryForeground: '#1c2940',
    secondary: '#203f43',
    secondaryForeground: '#e0f0ed',
    muted: '#243044',
    mutedForeground: '#9aa7b5',
    accent: '#f6d15a',
    accentForeground: '#293323',
    destructive: '#e87575',
    destructiveForeground: '#1c2940',
    border: '#35445c',
    input: '#40506a',
    sidebar: '#0f1725',
    sidebarForeground: '#f3efe8',
    sidebarAccent: '#1f304b',
    success: '#65b99c',
    coralSoft: '#49352f',
    cyanSoft: '#1f3e42',
    amberSoft: '#4d4324',
  },
  radius: 12,
};

export default colors;
