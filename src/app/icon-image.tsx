import { ImageResponse } from "next/og";

type StarterIconOptions = {
  size: number;
  radius: number;
  wordmarkSize: number;
};

export function createStarterIcon({ size, radius, wordmarkSize }: StarterIconOptions) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius,
        backgroundColor: "#17211d",
        color: "#fffdf7",
        fontFamily: "sans-serif",
        fontSize: wordmarkSize,
        fontWeight: 800,
        letterSpacing: "-0.08em",
      }}
    >
      <span>N</span>
      <span style={{ color: "#d8ff72" }}>/</span>
    </div>,
    { width: size, height: size },
  );
}
