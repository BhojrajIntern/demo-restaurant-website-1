import { json, route } from "@/lib/server/api";
import { adminPassword, isLoggedIn } from "@/lib/server/auth";

export const GET = route(async (req) => json({ loggedIn: isLoggedIn(req), configured: adminPassword() !== null }));
