export default [
  {
    path: '/dashboard',
    name: 'Overview',
      icon: 'DashboardOutlined',
    component: './Dashboard/Dashboard',
    //  access: 'canClient',
  },
  {
    path: '/admin/admindashboard',
    // name: 'Dashboard',
    icon: 'LineChart',
    component: './Admin/AdminDashboard',
    access: 'canAdmin',
  },
  {
    path: '/admin/leads',
    name: 'Clients',
    icon: 'user',
    component: './Admin/Leads',
    access: 'canAdmin',
  },

  {
    path: '/admin',
    name: 'Finance',
    icon: 'dollar',
    access: 'canAdmin',
    routes: [
      {
        path: '/admin/transactions',
        name: 'Deposit',
        icon: 'dollar',
        component: './Admin/TransactionRequests',
      },

      {
        path: '/admin/withdrawTransaction',
        name: 'Withdraw',
        icon: 'dollar',
        component: './Admin/WithdrawTransaction',
      },
    ],
  },

  {
    path: '/admin/admin',
    name: 'Settings',
    icon: 'setting',
    component: './Admin/Admin',
    access: 'canAdmin',
  },
  // {
  //   path: '/admin/ibsettings',
  //   name: 'IB Settings',
  //   icon: 'setting',
  //   component: './Admin/IBSettings',
  //   access: 'canAdmin',
  // },
  {
    path: '/admin/ibrequests',
    name: 'IB',
    icon: 'AppstoreOutlined',
    component: './Admin/IBRequests',
    access: 'canAdmin',
  },

  {
    path: '/admin/helpDeskAdmin',
    name: 'Help Desk',
    icon: 'team',
    component: './Admin/HelpDeskAdmin',
    access: 'canAdmin',
  },

  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
      {
        path: '/user/login/Forgotpassword',
        component: './User/Login/ForgotPassword',
      },
      {
        path: '/user/login/Signup',
        component: './User/Login/Signup',
      },
      {
        path: '/user/login/Resetpassword',
        component: './User/Login/Resetpassword',
      },
      /*   {
        path: '/user/login/SettingSignup',
        component: './User/Login/SettingSignup',
        } */
    ],
  },

  {
    path: '/profile',
    // name: 'profile',
    icon: 'profile',
    component: './Profile/Profile',
  },
  {
    path: '/ProfileSettings',
    component: './Profile/ProfileSettings',
  },
  {
    path: '/MyDetails',
    component: './Profile/MyDetails',
  },
  {
    path: '/Verification',
    component: './Profile/Verification',
  },
  {
    path: '/Password',
    component: './Profile/Password',
  },
  {
    path: '/IBcode',
    component: './Profile/IBcode',
  },
  {
    path: '/ProfileSettings',
      icon: 'SettingOutlined',
    name: ' Personalize Account',
    component: './Profile/ProfileSettings',
    access: 'canClient',
  },

  {
    path: '/finops',
    name: 'Finance',
     icon: 'BankOutlined',
    access: 'canClient',
    routes: [
      {
        path: '/finops',
        redirect: '/finops/deposit',
      },
      {
        path: '/finops/deposit',
        icon: 'dollar',
        name: 'Deposit',
        component: './Finops/Deposit',
      },
      {
        path: '/finops/depositcard',
        component: './Finops/DepositCard',
      },
      /*     {
        path: '/finops/Deposit_Cards/DepositCard_step1',
        component: './Finops/Deposit_Cards/DepositCard_step1'
      },
      {
        path: '/finops/Deposit_Cards/DepositCard_step2',
        component: './Finops/Deposit_Cards/DepositCard_step2'
      },
      {
        path: '/finops/Deposit_Cards/DepositCard_step3',
        component: './Finops/Deposit_Cards/DepositCard_step3'
      },
      {
        path: '/finops/Deposit_Cards/DepositCard_step4',
        component: './Finops/Deposit_Cards/DepositCard_step4'
      }, */
      {
        path: '/finops/deposittransfer',
        component: './Finops/DepositTransfer',
      },
      {
        path: '/finops/paymentlink3',
        // name:'PaymentLink3',
        component: './Finops/PaymentLink3',
      },
      {
        path: '/finops/withdrawcard',
        component: './Finops/WithdrawCard',
      },
      {
        path: '/finops/withdrawtransfer',
        component: './Finops/WithdrawTransfer',
      },
      {
        path: '/finops/DepositTable',
        component: './Finops/DepositTable',
      },
      {
        path: '/finops/DepositTabs',
        component: './Finops/DepositTabs',
      },

      {
        path: '/finops/withdraw',
        name: 'Withdraw',
        icon: 'dollar',
        component: './Finops/Withdraw',
      },
      // {
      //   path: '/finops/wallet_transfer',
      //   name: 'wallet_transfer',
      //   component: './Finops/WalletTransfer',
      // },
      {
        path: '/finops/transaction_history',
        name: 'Transaction Records',
        component: './Finops/TransactionHistory',
      },
      {
        path: '/finops/deposit_steps',
        // name: 'Deposit_Steps',
        component: './Finops/Deposit_Steps',
      },
      {
        path: '/finops/deposit_transfer',
        // name: 'Deposit_T',
        component: './Finops/Deposit_Transfer',
      },
    ],
  },
  {
    path: '/ib',
    name: 'IB Hub',
   icon: 'IdcardOutlined',
    component: './IB/Dashboard',
    access: 'canClient',
  },

  {
    path: '/admin/helpDeskUser',
    name: 'Assistance',
    icon: 'MessageOutlined',
    component: './Admin/HelpDeskUser',
    access: 'canClient',
  },
  {
    path: '/signout',
    name: 'Logout',
    icon: 'PoweroffOutlined',
    component: './SignOut',
  },

  {
    path: '/',
    redirect: '/user/login',
  },

  {
    path: '*',
    layout: false,
    component: './404',
  },
];
