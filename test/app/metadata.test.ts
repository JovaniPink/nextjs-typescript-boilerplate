import manifest from "@/app/manifest";
import { starterIconSizes, starterManifestIcons } from "@/app/metadata-contract";

describe("starter metadata", () => {
  it("exposes the canonical browser and device icon sizes", () => {
    expect(starterIconSizes).toEqual({
      favicon: 64,
      small: 48,
      large: 192,
      apple: 180,
    });
  });

  it("references the deterministic icon routes from the web manifest", () => {
    expect(manifest().icons).toEqual(starterManifestIcons);
  });
});
