import * as admin from 'firebase-admin';

// Initialize Firebase Admin for token verification
// Since we only need to verify ID tokens, we don't need the full service account private key.
// We just need the projectId.
admin.initializeApp({
  projectId: 'ms-happido',
});

export default admin;
