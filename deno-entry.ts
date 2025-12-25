import { serveDir } from "jsr:@std/http/file-server";

const API_BASE = "https://halolight-edge-api.h7ml.cn";

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  // API 代理
  if (url.pathname.startsWith("/api/")) {
    const apiPath = url.pathname.slice(4);
    const apiUrl = `${API_BASE}${apiPath}${url.search}`;
    const headers = new Headers(req.headers);
    headers.delete("host");
    return fetch(apiUrl, { method: req.method, headers, body: req.body });
  }

  // 静态文件
  return serveDir(req, { fsRoot: ".", showIndex: true });
});
