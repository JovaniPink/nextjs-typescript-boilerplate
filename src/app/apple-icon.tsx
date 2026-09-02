import { createStarterIcon } from "./icon-image";
import { starterIconSizes } from "./metadata-contract";

export const dynamic = "force-static";
export const size = { width: starterIconSizes.apple, height: starterIconSizes.apple };
export const contentType = "image/png";

export default function AppleIcon() {
  return createStarterIcon({ size: size.width, radius: 36, wordmarkSize: 86 });
}
