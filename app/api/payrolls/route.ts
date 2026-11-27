import { NextResponse } from 'next/server';

// دالة مساعدة للتحقق من المتغيرات
function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(`Missing Env Vars: URL=${!!url}, KEY=${!!key}`);
  }
  return { url, key };
}

export async function GET(request: Request) {
  try {
    const { url, key } = getSupabaseConfig();
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const res = await fetch(`${url}/rest/v1/payrolls?wallet_address=eq.${wallet}&order=created_at.desc`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Fetch failed');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { url, key } = getSupabaseConfig();
    const body = await request.json();
    const { wallet_address, title, interval, next_run, content } = body;

    if (!wallet_address || !title || !interval || !next_run || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const res = await fetch(`${url}/rest/v1/payrolls`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // يعيد السجل الذي تم إدخاله
      },
      body: JSON.stringify({
        wallet_address,
        title,
        interval,
        next_run,
        content
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Insert failed');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("POST Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url, key } = getSupabaseConfig();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const res = await fetch(`${url}/rest/v1/payrolls?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Delete failed');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}