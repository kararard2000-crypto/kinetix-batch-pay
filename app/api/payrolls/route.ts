import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';
    
    if (!supabaseUrl || !supabaseSecret) {
      throw new Error(`Missing Env Vars: URL is ${!!supabaseUrl}, Secret is ${!!supabaseSecret}`);
    }

    const supabase = createClient(supabaseUrl, supabaseSecret);
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('payrolls')
      .select('*')
      .eq('wallet_address', wallet)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET Error:", error.message); // سيظهر في Logs
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';
    
    // إذا كان أحد المتغيرين مفقوداً، نرمي خطأ واضحاً
    if (!supabaseUrl || !supabaseSecret) {
      throw new Error(`Missing Env Vars: URL is ${!!supabaseUrl}, Secret is ${!!supabaseSecret}`);
    }

    const supabase = createClient(supabaseUrl, supabaseSecret);
    
    const body = await request.json();
    const { wallet_address, title, interval, next_run, content } = body;

    if (!wallet_address || !title || !interval || !next_run || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('payrolls')
      .insert([{ wallet_address, title, interval, next_run, content }])
      .select();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("POST Error:", error.message); // سيظهر في Logs
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';
    
    if (!supabaseUrl || !supabaseSecret) {
      throw new Error(`Missing Env Vars: URL is ${!!supabaseUrl}, Secret is ${!!supabaseSecret}`);
    }

    const supabase = createClient(supabaseUrl, supabaseSecret);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('payrolls')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Error:", error.message); // سيظهر في Logs
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}