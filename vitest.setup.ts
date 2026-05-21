// Polyfill Response.json static method for Node < 21
if (typeof Response !== "undefined" && typeof (Response as any).json === "undefined") {
  (Response as any).json = (data: unknown, init?: ResponseInit) => {
    const headers = new Headers(init?.headers);
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    return new Response(JSON.stringify(data), { ...init, headers });
  };
}
