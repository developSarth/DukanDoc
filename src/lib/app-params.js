// Standalone app params (independent of Base44 cloud)
export const appParams = {
  appId: 'dukandoc-app',
  token: typeof window !== 'undefined' ? (localStorage.getItem('dukandoc_auth_token') || localStorage.getItem('legaldoc_auth_token')) : null,
  functionsVersion: '1.0.0',
  appBaseUrl: typeof window !== 'undefined' ? window.location.origin : '',
};
