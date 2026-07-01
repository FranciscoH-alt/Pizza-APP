import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { isAuthedRequest } from '@/lib/admin-auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthedRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: existing } = await supabaseService
    .from('battles')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Question not found (already deleted?)' }, { status: 404 });
  }

  const { error } = await supabaseService.from('battles').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Could not delete. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
