import { ProLayoutProps } from '@ant-design/pro-components';

const publicUrl = process.env.PUBLIC_URL || '';
/* const logoHeight = 200; 
const logoWidth = 300;  */
/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#c78534',
  layout: 'mix',
  // layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,

  title: ' ',
  pwa: true,
  logo: `${publicUrl}/images/Cosmomarkets.png`,
  // height: '40px',
  // width: '150px',
  iconfontUrl: '',
  siderMenuType: 'sub',
  token: {},
};

// Settings.title = '';

export default Settings;
