export function authErrorResponse(error, action) {
  // Do not expose connection strings, user data, or OTP values in logs.
  console.error(`[${action}]`, { name: error?.name, code: error?.code });
  if (error instanceof SyntaxError) {
    return Response.json({ success: false, message: 'Invalid JSON request body' }, { status: 400 });
  }
  if (['MongooseServerSelectionError', 'MongoServerSelectionError', 'MongoNetworkError',
    'MongoNetworkTimeoutError', 'MongoOperationTimeoutError'].includes(error?.name) ||
    ['ETIMEOUT', 'ENOTFOUND', 'ECONNREFUSED'].includes(error?.code)) {
    return Response.json({ success: false, code: 'AUTH_SERVICE_UNAVAILABLE',
      message: 'Login service is temporarily unavailable. Please try again shortly.' },
    { status: 503, headers: { 'Retry-After': '10', 'Cache-Control': 'no-store' } });
  }
  return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
}
