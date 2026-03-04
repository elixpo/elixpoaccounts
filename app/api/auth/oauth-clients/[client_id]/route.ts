export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { getOAuthClientById, getOAuthClientByIdWithSecret, updateOAuthClient } from '@/lib/db';
import { getDatabase } from '@/lib/d1-client';

/**
 * PUT /api/auth/oauth-clients/[client_id]
 * UPDATE /api/auth/oauth-clients/[client_id]
 *
 * Update OAuth application details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ client_id: string }> }
) {
  try {
    const token = request.cookies.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { client_id } = await params;
    const body = await request.json();
    const { name, redirect_uris, scopes } = body;

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Verify ownership
    const app = await getOAuthClientByIdWithSecret(db, client_id) as any;
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    if (app.owner_id !== payload.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      await updateOAuthClient(db, client_id, {
        ...(name && { name }),
        ...(redirect_uris && { redirectUris: JSON.stringify(redirect_uris) }),
        ...(scopes && { scopes: JSON.stringify(scopes) }),
      });
    } catch (error) {
      console.error('[OAuth Client] Database update error:', error);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      client_id,
    });
  } catch (error) {
    console.error('[OAuth Client] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/oauth-clients/[client_id]
 *
 * Deactivate an OAuth application
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ client_id: string }> }
) {
  try {
    const token = request.cookies.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { client_id } = await params;

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Verify ownership
    const app = await getOAuthClientByIdWithSecret(db, client_id) as any;
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    if (app.owner_id !== payload.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      await updateOAuthClient(db, client_id, { isActive: false });
    } catch (error) {
      console.error('[OAuth Client] Database delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      );
    }

    console.log(`[OAuth Client] Deactivated: ${client_id}`);

    return NextResponse.json({
      message: 'Application deactivated successfully',
      client_id,
    });
  } catch (error) {
    console.error('[OAuth Client] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/oauth-clients/[client_id]
 *
 * Get OAuth application details (public info only)
 * Query params:
 *   - validate_redirect_uri: optional redirect URI to validate against registered URIs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ client_id: string }> }
) {
  try {
    const token = request.cookies.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { client_id } = await params;
    const validateRedirectUri = request.nextUrl.searchParams.get('validate_redirect_uri');

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    // Get from D1
    let app: any = null;
    try {
      const db = await getDatabase();
      app = await getOAuthClientById(db, client_id);
      if (!app) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      if (!(app as any).is_active) {
        return NextResponse.json({ error: 'Application is inactive' }, { status: 403 });
      }
    } catch (error) {
      console.error('[OAuth Client] Database get error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      );
    }

    const appData = {
      client_id,
      name: (app as any).name,
      redirect_uris: JSON.parse((app as any).redirect_uris || '[]'),
      scopes: JSON.parse((app as any).scopes || '[]'),
      is_active: (app as any).is_active,
      created_at: (app as any).created_at,
    };

    // Validate redirect URI if provided
    if (validateRedirectUri) {
      const isValidRedirectUri = appData.redirect_uris.includes(validateRedirectUri);
      if (!isValidRedirectUri) {
        return NextResponse.json(
          {
            error: 'Invalid redirect URI',
            message: `The provided redirect_uri is not registered for this application`,
            registeredUris: appData.redirect_uris,
          },
          { status: 400 }
        );
      }
    }

    // Return public client info (without secret)
    return NextResponse.json({
      client_id: appData.client_id,
      name: appData.name,
      redirect_uris: appData.redirect_uris,
      scopes: appData.scopes,
      is_active: appData.is_active,
      created_at: appData.created_at,
    });
  } catch (error) {
    console.error('[OAuth Client] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}
