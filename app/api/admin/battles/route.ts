import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { isAuthedRequest } from '@/lib/admin-auth';
import { parseBattleTrivia, stringifyBattleTrivia } from '@/lib/battle-trivia';
import type { Battle, AdminBattleListItem } from '@/types';

const BUCKET = 'battle-images';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function GET(req: NextRequest) {
  if (!isAuthedRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseService
    .from('battles')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load questions.' }, { status: 500 });
  }

  const battles: AdminBattleListItem[] = ((data ?? []) as Battle[]).map((b) => {
    const trivia = parseBattleTrivia(b.description);
    return {
      id: b.id,
      title: b.title,
      option_a: b.option_a,
      option_b: b.option_b,
      image_a: b.image_a,
      image_b: b.image_b,
      start_date: b.start_date,
      end_date: b.end_date,
      status: b.status,
      votes_a: b.votes_a,
      votes_b: b.votes_b,
      question: trivia.question,
      correct_option: trivia.correct_option,
      fun_fact: trivia.fun_fact,
    };
  });

  return NextResponse.json({ battles });
}

export async function POST(req: NextRequest) {
  if (!isAuthedRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Could not read the submitted form.' }, { status: 400 });
  }

  const optionA = (form.get('option_a') as string | null)?.trim() ?? '';
  const optionB = (form.get('option_b') as string | null)?.trim() ?? '';
  const question = (form.get('question') as string | null)?.trim() ?? '';
  const correctOption = form.get('correct_option') as string | null;
  const funFact = (form.get('fun_fact') as string | null)?.trim() ?? '';
  const rawLiveDate = (form.get('live_date') as string | null) ?? '';
  const imageA = form.get('image_a');
  const imageB = form.get('image_b');

  if (!optionA || !optionB) {
    return NextResponse.json({ error: 'Please name both options.' }, { status: 400 });
  }
  if (!question) {
    return NextResponse.json({ error: 'Please enter a question.' }, { status: 400 });
  }
  if (correctOption !== 'a' && correctOption !== 'b') {
    return NextResponse.json({ error: 'Please choose which option is correct.' }, { status: 400 });
  }
  if (!(imageA instanceof File) || !(imageB instanceof File) || imageA.size === 0 || imageB.size === 0) {
    return NextResponse.json({ error: 'Please choose an image for both options.' }, { status: 400 });
  }

  for (const [label, file] of [['Option A', imageA] as const, ['Option B', imageB] as const]) {
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: `${label}'s file doesn't look like an image.` }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: `${label}'s image is too large (max 5MB).` }, { status: 400 });
    }
    if (!EXT_BY_MIME[file.type]) {
      return NextResponse.json({ error: `${label}'s image type isn't supported. Use JPG, PNG, WEBP, or GIF.` }, { status: 400 });
    }
  }

  const liveDate = /^\d{4}-\d{2}-\d{2}$/.test(rawLiveDate) && !isNaN(Date.parse(rawLiveDate))
    ? rawLiveDate
    : new Date().toISOString().split('T')[0];

  const uploadedPaths: string[] = [];
  const publicUrls: Record<'a' | 'b', string> = { a: '', b: '' };

  try {
    for (const [side, file] of [['a', imageA] as const, ['b', imageB] as const]) {
      const ext = EXT_BY_MIME[file.type];
      const filename = `${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabaseService.storage
        .from(BUCKET)
        .upload(filename, buffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        throw new Error('upload_failed');
      }

      uploadedPaths.push(filename);
      const { data: urlData } = supabaseService.storage.from(BUCKET).getPublicUrl(filename);
      publicUrls[side] = urlData.publicUrl;
    }
  } catch {
    if (uploadedPaths.length) {
      await supabaseService.storage.from(BUCKET).remove(uploadedPaths).catch(() => {});
    }
    return NextResponse.json({ error: 'Could not upload images. Please try again.' }, { status: 500 });
  }

  const title = `${optionA} vs ${optionB}`;
  const description = stringifyBattleTrivia({
    question,
    correct_option: correctOption,
    fun_fact: funFact || null,
  });

  const { data: inserted, error: insertError } = await supabaseService
    .from('battles')
    .insert({
      title,
      option_a: optionA,
      option_b: optionB,
      image_a: publicUrls.a,
      image_b: publicUrls.b,
      description,
      start_date: liveDate,
      end_date: liveDate,
      status: 'active',
    })
    .select()
    .single();

  if (insertError) {
    await supabaseService.storage.from(BUCKET).remove(uploadedPaths).catch(() => {});
    return NextResponse.json(
      { error: 'Images uploaded but saving the question failed. Please try again — nothing was published.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ battle: inserted });
}
