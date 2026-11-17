import { NextRequest, NextResponse } from 'next/server';
import { applyServerCorrection, getServerCorrections } from '@/lib/mvpServerStore';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { CorrectionField, CorrectionReport } from '@/types/provider';

const VALID_FIELDS: CorrectionField[] = [
  'hours',
  'phone',
  'emergency_status',
  'services',
  'address',
];

export async function GET() {
  return NextResponse.json({ corrections: getServerCorrections() });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CorrectionReport>;
    const providerId = body.providerId?.trim();
    const field = body.field;
    const suggestedValue = body.suggestedValue?.trim();

    if (!providerId || !field || !VALID_FIELDS.includes(field) || !suggestedValue) {
      return NextResponse.json(
        { error: 'Provider ID, correction field, and updated detail are required.' },
        { status: 400 }
      );
    }

    const report: CorrectionReport = {
      id: `corr-${Date.now().toString(36)}`,
      providerId,
      field,
      suggestedValue,
      notes: body.notes?.trim() ?? '',
      submittedBy: body.submittedBy?.trim() || 'Community Member',
      status: 'applied_mvp',
      createdAt: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('corrections').insert({
        id: report.id,
        provider_id: report.providerId,
        field: report.field,
        suggested_value: report.suggestedValue,
        notes: report.notes,
        submitted_by: report.submittedBy,
        status: report.status,
        created_at: report.createdAt,
      });
    }

    const result = applyServerCorrection(report);
    return NextResponse.json(
      {
        report: result.report,
        updatedProvider: result.updatedProvider,
        source: supabase ? 'supabase' : 'mvp-local',
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid correction request payload.' }, { status: 400 });
  }
}
