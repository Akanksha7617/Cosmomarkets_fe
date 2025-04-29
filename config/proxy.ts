/**
 * @name strrstrrstrrstrrstrr
 * @see strrstrrstrrstrrstrr strrstrrstrrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  // strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr  strrstrrstrrstrrstrrstrrstrrstrrstrr
  // dev: {
  //   // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
  //   '/api/': {
  //     // strrstrrstrrstrrstrrstrr
  //     target: 'https://preview.pro.ant.design',
  //     // strrstrrstrrstrrstrrstrrstrrstrr http strrstrrstrr https
  //     // strrstrr origin strrstrrstrrstrrstrrstrrstrrstrrstrr，strrstrr cookie
  //     changeOrigin: true,
  //   },
  // },

  /**
   * @name strrstrrstrrstrrstrrstrrstrr
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      target: 'https://proapi.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
