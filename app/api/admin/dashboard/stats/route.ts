export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../../src/lib/admin-middleware';
import { getAdminDashboardStats, getRequestTrend, getTopApps } from '../../../../../src/lib/db';
import { getDatabase } from '../../../../../src/lib/d1-client';
import { cacheGetOrSet } from '../../../../../src/lib/kv-cache';

export async function GET(request: NextRequest) {
  const session = await verifyAdminSession(request);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('range') || '7d';

    const daysBack = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7;

    const result = await cacheGetOrSet(`admin:stats:${timeRange}`, 300, async () => {
      const db = await getDatabase();
      const [stats, requestTrend, topApps] = await Promise.all([
        getAdminDashboardStats(db, daysBack),
        getRequestTrend(db, daysBack > 30 ? 30 : daysBack),
        getTopApps(db, 5),
      ]);
      return { ...stats, requestTrend, topApps };
    });

    return NextResponse.json({
      ...result,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
