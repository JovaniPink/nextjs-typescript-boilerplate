import { createStarterIcon } from "./icon-image";
import { starterIconSizes } from "./metadata-contract";

export const dynamic = "force-static";
export const size = { width: starterIconSizes.large, height: starterIconSizes.large };
export const contentType = "image/png";

export default function Icon() {
  return createStarterIcon({ size: size.width, radius: 40, wordmarkSize: 92 });
}
