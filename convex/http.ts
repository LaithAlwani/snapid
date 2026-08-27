import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Registers /api/auth/* routes used by @convex-dev/auth.
auth.addHttpRoutes(http);

export default http;
