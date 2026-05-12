import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'https//auth.treepruning.com',
  realm: 'treepruning',
  clientId: 'vue-frontend'
})

export default keycloak