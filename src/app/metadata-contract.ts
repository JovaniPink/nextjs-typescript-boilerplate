export const starterIconSizes = {
  favicon: 64,
  small: 48,
  large: 192,
  apple: 180,
} as const;

export const starterManifestIcons = [
  { src: "/icon0", sizes: "48x48", type: "image/png" },
  { src: "/icon1", sizes: "192x192", type: "image/png" },
  { src: "/apple-icon", sizes: "180x180", type: "image/png" },
] as const;
