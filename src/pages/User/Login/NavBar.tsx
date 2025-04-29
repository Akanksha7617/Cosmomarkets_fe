import { Button } from 'antd';
import '../../../common.css';

export const Navbar = () => {
  return (
    <div className="header-section">
      <div className="container-fluid">
        <a href="logo" className="site-logo">
          <img src="/images/logo.png" alt="" style={{ width: 197, height: 56 }}></img>
        </a>

        {/* <a href="Signup" className="site-btn"> Request Demo</a> */}

        <nav className="main-menu">
          {/* <a href={'/user/login/'}>Login</a> */}
          <Button className="login-btn" type="link" href="/user/login/">
            Login
          </Button>
        </nav>
      </div>
    </div>
  );
};
export default Navbar;
