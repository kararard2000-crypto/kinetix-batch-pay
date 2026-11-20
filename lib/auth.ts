import crypto from "crypto";
import nacl from "tweetnacl";
import bs58 from "bs58";

const mac = (p: string) => crypto.createHmac("sha256", process.env.SESSION_SECRET || "fallback_secret_key").update(p).digest("base64url");
const eq = (a: string, b: string) => typeof a === "string" && typeof b === "string" && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Stateless, HMAC-signed, 5-minute nonce (works on serverless). */
export function newNonce() { 
  const p = `${crypto.randomBytes(16).toString("hex")}.${Date.now() + 300_000}`; 
  return `${p}.${mac(p)}`; 
}

export const message = (nonce: string) => `Kinetix admin sign-in\nNonce: ${nonce}`;

export function verifyLogin(pubkey: string, sigB64: string, nonce: string) {
  try {
    if (!pubkey || !sigB64 || !nonce) return false;
    const [r, exp, m] = String(nonce).split(".");
    if (!r || !exp || !m || !eq(m, mac(`${r}.${exp}`)) || Number(exp) < Date.now()) return false;
    if (!process.env.OWNER_WALLET || pubkey !== process.env.OWNER_WALLET) return false;
    
    return nacl.sign.detached.verify(
      new TextEncoder().encode(message(nonce)), 
      Buffer.from(sigB64, "base64"), 
      bs58.decode(pubkey)
    );
  } catch {
    return false;
  }
}

export const issue = () => { 
  const p = Buffer.from(JSON.stringify({ exp: Date.now() + 30 * 60_000 })).toString("base64url"); 
  return `${p}.${mac(p)}`; 
};

export function isAdmin(token?: string) {
  try {
    const [p, m] = (token ?? "").split(".");
    if (!p || !m || !eq(m, mac(p))) return false;
    const parsed = JSON.parse(Buffer.from(p, "base64url").toString());
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}