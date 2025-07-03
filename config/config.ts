// https://umijs.org/config/
import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV = 'dev' } = process.env;

export default defineConfig({
  /**
   * @name strrstrr hash strrstrr
   * @description strr build strrstrrstrrstrrstrrstrrstrr hash strrstrr。strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr。
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,

  /**
   * @name strrstrrstrrstrrstrr
   * @description strrstrr ie11 strrstrrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr
   * @doc https://umijs.org/docs/api/config#targets
   */
  // targets: {
  //   ie: 11,
  // },
  /**
   * @name strrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr
   * @description strrstrrstrr path，component，routes，redirect，wrappers，title strrstrrstrr
   * @doc https://umijs.org/docs/guides/routes
   */
  // umi routes: https://umijs.org/docs/routing
  routes,
  /**
   * @name strrstrrstrrstrrstrr
   * @description strrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrr less strrstrrstrrstrrstrr
   * @doc antdstrrstrrstrrstrrstrr https://ant.design/docs/react/customize-theme-cn
   * @doc umi strrtheme strrstrr https://umijs.org/docs/api/config#theme
   */
  theme: {
    // strrstrrstrrstrrstrr configProvide strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr default
    // strrstrrstrrstrrstrr variable， strrstrrstrrstrr configProvide strrstrrstrrstrrstrrstrrstrr
    'root-entry-name': 'variable',
  },
  /**
   * @name moment strrstrrstrrstrrstrrstrr
   * @description strrstrrstrrstrrstrrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrrjsstrrstrrstrrstrr
   * @doc https://umijs.org/docs/api/config#ignoremomentlocale
   */
  ignoreMomentLocale: true,
  /**
   * @name strrstrrstrrstrr
   * @description strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr
   * @see strrstrrstrrstrrstrr strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr，build strrstrrstrrstrrstrrstrrstrrstrr。
   * @doc strrstrrstrrstrr https://umijs.org/docs/guides/proxy
   * @doc strrstrrstrrstrr https://umijs.org/docs/api/config#proxy
   */
  proxy: proxy[REACT_APP_ENV as keyof typeof proxy],
  /**
   * @name strrstrrstrrstrrstrrstrrstrr
   * @description strrstrrstrrstrrstrrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrr state
   */
  fastRefresh: true,
  //============== strrstrrstrrstrrmaxstrrstrrstrrstrrstrr ===============
  /**
   * @name strrstrrstrrstrrstrr
   * @@doc https://umijs.org/docs/max/data-flow
   */
  model: {},
  /**
   * strrstrrstrrstrrstrrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr
   * @description strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrrstrrstrr Umi strrstrrstrrstrrstrrstrrstrrstrr。
   * @doc https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
   */
  initialState: {},
  /**
   * @name layout strrstrr
   * @doc https://umijs.org/docs/max/layout-menu
   */
  title: 'Mevora Capital',
  layout: {
    locale: true,
    ...defaultSettings,
  },
  /**
   * @name moment2dayjs strrstrr
   * @description strrstrrstrrstrrstrr moment strrstrrstrr dayjs
   * @doc https://umijs.org/docs/max/moment2dayjs
   */
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },
  /**
   * @name strrstrrstrrstrrstrr
   * @doc https://umijs.org/docs/max/i18n
   */
  locale: {
    // default zh-CN
    default: 'en-US',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  /**
   * @name antd strrstrr
   * @description strrstrrstrr babel import strrstrr
   * @doc https://umijs.org/docs/max/antd#antd
   */
  antd: {},
  /**
   * @name strrstrrstrrstrrstrrstrr
   * @description strrstrrstrr axios strr ahooks strr useRequest strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr。
   * @doc https://umijs.org/docs/max/request
   */
  request: {},
  /**
   * @name strrstrrstrrstrr
   * @description strrstrr initialState strrstrrstrrstrrstrr，strrstrrstrrstrrstrr initialState
   * @doc https://umijs.org/docs/max/access
   */
  access: {},
  /**
   * @name <head> strrstrrstrrstrr script
   * @description strrstrr <head> strrstrrstrrstrr script
   */
  headScripts: [
    // strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr
    { src: '/scripts/loading.js', async: true },
  ],
  //================ pro strrstrrstrrstrr =================
  presets: ['umi-presets-pro'],
  /**
   * @name openAPI strrstrrstrrstrrstrr
   * @description strrstrr openapi strrstrrstrrstrrstrrserve strrmock，strrstrrstrrstrrstrrstrrstrrstrrstrr
   * @doc https://pro.ant.design/zh-cn/docs/openapi/
   */
  openAPI: [
    // {
    //   requestLibPath: "import { request } from '@umijs/max'",
    //   // strrstrrstrrstrrstrrstrrstrrstrrstrr
    //   // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
    //   schemaPath: join(__dirname, 'oneapi.json'),
    //   mock: false,
    // },
    // {
    //   requestLibPath: "import { request } from '@umijs/max'",
    //   schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
    //   projectName: 'swagger',
    // },
  ],
  mfsu: {
    strategy: 'normal',
  },
  requestRecord: {},
  esbuildMinifyIIFE: true
});
