export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      service: "nextjs-typescript-boilerplate",
      status: "ok",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
