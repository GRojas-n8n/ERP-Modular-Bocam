import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://ab7e600c76d7c0821f38a2405ab2e253@o4511316925284352.ingest.us.sentry.io/4511531332534272',
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
