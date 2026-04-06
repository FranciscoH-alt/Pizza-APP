import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * GET /api/battles
 * Returns all battles sorted by start_date ASC.
 * Used by the Play Again feature to cycle through unvoted battles.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('battles')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
