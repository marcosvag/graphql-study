import * as jwt from "jsonwebtoken";
import { Context } from "../context";

export const APP_SECRET = "GraphQL-is-aw3some";

export interface AuthTokenPayload {
    userId: number;
}

export function decodeAuthHeader(authHeader: String): AuthTokenPayload {
    const token = authHeader.replace("Bearer ", "");

    if(!token) {
        throw new Error("No token found");
    }
    return jwt.verify(token, APP_SECRET) as AuthTokenPayload;
}

export const ensureAuthMutation = (ctx: Context, action: String) => {
    if(!ctx.userId) {
        throw new Error(`Cannot ${action} without loggin in.`)
    }
}