import { NextRequest, NextResponse } from "next/server";
import { issue, message, newNonce, verifyLogin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = () => { 
  const nonce = newNonce(); 
  return NextResponse.json({ nonce, message: message(nonce) }); 
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { publicKey, signature, nonce } = body || {};

    if (!publicKey || !signature || !nonce) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!verifyLogin(publicKey, signature, nonce)) {
      return NextResponse.json({ error: "Not the owner wallet" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    
    // Secure cookie settings for admin session
    res.cookies.set("kntx_admin", issue(), { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      path: "/", 
      maxAge: 1800 
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}