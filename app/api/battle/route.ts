import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabaseServer
    .from('battles')
    .select('*')
    .eq('status', 'active')
    .lte('start_date', today)
    .gte('end_date', today)
    .order('start_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // Fallback: return most recent battle regardless of date
    const { data: fallback } = await supabaseServer
      .from('battles')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(1)
      .single();

    if (!fallback) {
      return NextResponse.json({ error: 'No battle found' }, { status: 404 });
    }
    return NextResponse.json(fallback);
  }

  return NextResponse.json(data);
}
