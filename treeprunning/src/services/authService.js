import keycloak from '../keycloack'

const authService = {
  init: (options = { onLoad: 'login-required', checkLoginIframe: false }) => {
    return keycloak.init(options).then((authenticated) => {
      // Periodic token refresh: try to renew token every minute
      setInterval(() => {
        keycloak.updateToken(30).catch(() => {
          console.warn('Failed to refresh Keycloak token');
        });
      }, 60000);

      return authenticated;
    });
  },

  getToken: () => keycloak.token,

  updateToken: (minValidity = 30) => {
    return keycloak.updateToken(minValidity).then(() => keycloak.token).catch(async () => {
      try {
        await keycloak.login();
      } catch (e) {
        console.error('Login required, could not refresh token', e);
      }
      return null;
    });
  },

  login: (opts) => keycloak.login(opts),
  logout: (opts) => keycloak.logout(opts),
  isAuthenticated: () => keycloak.authenticated,
  getUserInfo: () => keycloak.tokenParsed,
  rawKeycloak: keycloak
}

export default authService
