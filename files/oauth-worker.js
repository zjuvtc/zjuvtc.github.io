/**
 * Cloudflare Worker — GitHub OAuth Proxy for Decap CMS
 *
 * Deploy steps (one-time, takes ~5 minutes):
 *   1. npm install -g wrangler
 *   2. wrangler login
 *   3. wrangler deploy oauth-worker.js --name jiaotuan-oauth
 *   4. wrangler secret put GITHUB_CLIENT_ID
 *   5. wrangler secret put GITHUB_CLIENT_SECRET
 *
 * Then set base_url in admin/config.yml to:
 *   https://jiaotuan-oauth.<your-subdomain>.workers.dev
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname === '/auth') {
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set('scope', 'repo,user');
      authUrl.searchParams.set('state', crypto.randomUUID());
      return Response.redirect(authUrl.toString(), 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          client_id:     env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const { access_token, error } = await tokenRes.json();
      if (error || !access_token) {
        return new Response('OAuth error: ' + (error || 'no token'), { status: 400 });
      }

      const data = JSON.stringify({ token: access_token, provider: 'github' });
      const html = `<!DOCTYPE html><html><body><script>
        (function() {
          function cb(e) {
            window.opener.postMessage('authorization:github:success:${data.replace(/'/g, "\\'")}', e.origin);
          }
          window.addEventListener('message', cb, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      </script></body></html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html', ...corsHeaders() },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
