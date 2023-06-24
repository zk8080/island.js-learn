import { join } from "path";

export const PACKAGE_ROOT = join(__dirname, "..");

export const DEFAULT_HTML_PATH = join(PACKAGE_ROOT, "template.html");

export const CLIENT_ENTRY_PATH = join(PACKAGE_ROOT, "src", "runtime", "client-entry.tsx");

export const SERVER_ENTRY_PATH = join(PACKAGE_ROOT, "src", "runtime", "server-entry.tsx");

export const MD_REGEX = /\.mdx?$/;

export const PUBLIC_DIR = "public";

export const MASK_SPLITTER = "!!ISLAND!!";

export const EXTERNALS = ["react", "react-dom", "react-dom/client", "react/jsx-runtime"];
