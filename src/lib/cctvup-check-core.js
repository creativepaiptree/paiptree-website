export function getCctvUpCronAuthState({ expectedSecret, providedSecret }) {
  const trimmedExpected = typeof expectedSecret === 'string' ? expectedSecret.trim() : '';
  const trimmedProvided = typeof providedSecret === 'string' ? providedSecret.trim() : '';

  if (!trimmedExpected) {
    return {
      ok: false,
      status: 503,
      mode: 'unconfigured',
      message: 'CCTVUP_CRON_TRIGGER_SECRET is not configured.',
    };
  }

  if (!trimmedProvided) {
    return {
      ok: false,
      status: 401,
      mode: 'protected',
      message: 'Unauthorized CCTVUP check request: missing secret.',
    };
  }

  if (trimmedProvided !== trimmedExpected) {
    return {
      ok: false,
      status: 401,
      mode: 'protected',
      message: 'Unauthorized CCTVUP check request: secret mismatch.',
    };
  }

  return {
    ok: true,
    status: 200,
    mode: 'protected',
    message: 'CCTVUP cron secret accepted.',
  };
}

export function createCctvUpCheckRunner({ loadCurrentPayload, persistHistory }) {
  if (typeof loadCurrentPayload !== 'function') {
    throw new TypeError('loadCurrentPayload must be a function');
  }

  if (typeof persistHistory !== 'function') {
    throw new TypeError('persistHistory must be a function');
  }

  return async () => {
    const payload = await loadCurrentPayload();
    const persistResult = await persistHistory(payload);

    return {
      ok: Boolean(persistResult && persistResult.ok),
      payload,
      persistResult,
    };
  };
}