// Standalone app params (independent of Base44 cloud)
export const appParams = {
  appId: 'legaldoc-app',
  token: typeof window !== 'undefined' ? localStorage.getItem('legaldoc_auth_token') : null,
  functionsVersion: '1.0.0',
  appBaseUrl: typeof window !== 'undefined' ? window.location.origin : '',
};
