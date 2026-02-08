import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/error?error=${error}&description=${searchParams.get('error_description') || 'An error occurred'}`, request.url)
    );
  }

  // Handle provider-specific callback logic
  try {
    // TODO: Exchange code for tokens with the provider
    // This is where you'd call your backend to exchange the authorization code for access tokens
    
    switch (provider) {
      case 'google':
        // Handle Google OAuth callback
        break;
      case 'github':
        // Handle GitHub OAuth callback
        break;
      case 'discord':
        // Handle Discord OAuth callback
        break;
      default:
        return NextResponse.redirect(new URL('/error?error=invalid_provider', request.url));
    }

    // After successful authentication, redirect to home or dashboard
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error(`OAuth callback error for ${provider}:`, error);
    return NextResponse.redirect(
      new URL('/error?error=server_error&description=Failed to process authentication', request.url)
    );
  }
}
