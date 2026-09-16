import { BrowserView, BrowserWindow, Updater, type RPCSchema } from "electrobun/main";

import { requestHandlers } from "@main/rpc/handlers";
import { APP_NAME } from "@shared/app-info";
import type { AppRequests } from "@shared/rpc-contract";

const DEV_SERVER_URL = "http://localhost:5173";
const BUNDLED_URL = "views://mainview/index.html";

type AppRPC = {
  bun: RPCSchema<{ requests: AppRequests; messages: Record<string, never> }>;
  webview: RPCSchema<{
    requests: Record<string, never>;
    messages: Record<string, never>;
  }>;
};

async function resolveViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel !== "dev") return BUNDLED_URL;

  try {
    await fetch(DEV_SERVER_URL, { method: "HEAD" });
    return DEV_SERVER_URL;
  } catch {
    return BUNDLED_URL;
  }
}

const rpc = BrowserView.defineRPC<AppRPC>({
  maxRequestTime: 15000,
  handlers: {
    requests: requestHandlers,
    messages: {},
  },
});

const url = await resolveViewUrl();

new BrowserWindow({
  title: APP_NAME,
  url,
  rpc,
  frame: {
    width: 1280,
    height: 820,
    x: 120,
    y: 80,
  },
});
