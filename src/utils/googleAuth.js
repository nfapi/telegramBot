const { google } = require('googleapis');

let authClient = null;

/**
 * Get authenticated Google client using service account credentials
 */
async function getAuthClient() {
  if (authClient) {
    return authClient;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID || 'expense-bot',
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || 'key123',
        private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    authClient = await auth.getClient();
    return authClient;
  } catch (error) {
    console.error('Error authenticating with Google:', error);
    throw error;
  }
}

module.exports = {
  getAuthClient,
};
