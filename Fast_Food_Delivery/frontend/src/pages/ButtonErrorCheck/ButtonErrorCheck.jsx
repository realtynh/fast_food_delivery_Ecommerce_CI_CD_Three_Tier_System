import * as Sentry from '@sentry/react';
// Add this button component to your app to test Sentry's error tracking
const ErrorButton=()=> {
  return (
    <button
      onClick={() => {
        throw new Error('This is your first error!');
      }}
    >
      Break the world
    </button>
  );
}