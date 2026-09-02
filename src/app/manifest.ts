import type { MetadataRoute } from "next";

import { starterManifestIcons } from "./metadata-contract";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Next.js TypeScript Boilerplate",
    short_name: "Next.js Starter",
    description:
      "A production-minded Next.js and TypeScript starter with the quality bar built in.",
    start_url: "/",
    display: "browser",
    background_color: "#f4f1e8",
    theme_color: "#f4f1e8",
    icons: [...starterManifestIcons],
  };
}
