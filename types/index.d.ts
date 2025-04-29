export namespace API {
  /** GET /api/currentUser */
  export type GET_API_CURRENT_USER_QUERY = {
    /** example:  123 */
    token: string;
  };

  export type GET_API_CURRENT_USER_PAYLOAD = Record<string, any>;

  export type GET_API_CURRENT_USER_RES = {
    /** example: {"name": "Nix Kate", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png", "userid": "00000001", "email": "antdesign@alipay.com", "signature": "strrstrrstrrstrr，strrstrrstrrstrr", "title": "strrstrrstrrstrr", "group": "strrstrrstrrstrr－strrstrrstrrstrrstrrstrr－strrstrrstrrstrrstrr－strrstrrstrrstrrstrr－UED", "tags": [{"key": "0", "label": "strrstrrstrrstrrstrr"}, {"key": "1", "label": "strrstrrstrrstrr"}, {"key": "2", "label": "strr~"}, {"key": "3", "label": "strrstrrstrr"}, {"key": "4", "label": "strrstrrstrr"}, {"key": "5", "label": "strrstrrstrrstrr"}], "notifyCount": 12, "unreadCount": 11, "country": "China", "geographic": {"province": {"label": "strrstrrstrr", "key": "330000"}, "city": {"label": "strrstrrstrr", "key": "330100"}}, "address": "strrstrrstrrstrrstrrstrr 77 strr", "phone": "0752-268888888"} */
    data: {
      name: string;
      avatar: string;
      userid: string;
      email: string;
      signature: string;
      title: string;
      group: string;
      tags: {
        key: string;
        label: string;
      }[];
      notifyCount: number;
      unreadCount: number;
      country: string;
      geographic: {
        province: {
          label: string;
          key: string;
        };
        city: {
          label: string;
          key: string;
        };
      };
      address: string;
      phone: string;
    };
  };

  /** GET /api/rule */
  export type GET_API_RULE_QUERY = {
    /** example:  123 */
    token: string;
    /** example: 1 */
    current: string;
    /** example: 20 */
    pageSize: string;
  };

  export type GET_API_RULE_PAYLOAD = Record<string, any>;

  export type GET_API_RULE_RES = {
    /** example: [{"key": 99, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png", "name": "TradeCode 99", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 503, "status": "0", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 81}, {"key": 98, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png", "name": "TradeCode 98", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 164, "status": "0", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 12}, {"key": 97, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png", "name": "TradeCode 97", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 174, "status": "1", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 81}, {"key": 96, "disabled": true, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png", "name": "TradeCode 96", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 914, "status": "0", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 7}, {"key": 95, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png", "name": "TradeCode 95", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 698, "status": "2", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 82}, {"key": 94, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png", "name": "TradeCode 94", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 488, "status": "1", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 14}, {"key": 93, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png", "name": "TradeCode 93", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 580, "status": "2", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 77}, {"key": 92, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png", "name": "TradeCode 92", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 244, "status": "3", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 58}, {"key": 91, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png", "name": "TradeCode 91", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 959, "status": "0", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 66}, {"key": 90, "disabled": true, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png", "name": "TradeCode 90", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 958, "status": "0", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 72}, {"key": 89, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png", "name": "TradeCode 89", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 301, "status": "2", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 2}, {"key": 88, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png", "name": "TradeCode 88", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 277, "status": "1", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 12}, {"key": 87, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png", "name": "TradeCode 87", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 810, "status": "1", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 82}, {"key": 86, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png", "name": "TradeCode 86", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 780, "status": "3", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 22}, {"key": 85, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png", "name": "TradeCode 85", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 705, "status": "3", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 12}, {"key": 84, "disabled": true, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png", "name": "TradeCode 84", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 203, "status": "0", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 79}, {"key": 83, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png", "name": "TradeCode 83", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 491, "status": "2", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 59}, {"key": 82, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png", "name": "TradeCode 82", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 73, "status": "0", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 100}, {"key": 81, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png", "name": "TradeCode 81", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 406, "status": "3", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 61}, {"key": 80, "disabled": false, "href": "https: //ant.design", "avatar": "https: //gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png", "name": "TradeCode 80", "owner": "strrstrrstrr", "desc": "strrstrrstrrstrrstrrstrr", "callNo": 112, "status": "2", "updatedAt": "2022-12-06T05: 00: 57.040Z", "createdAt": "2022-12-06T05: 00: 57.040Z", "progress": 20}] */
    data: {
      key: number;
      disabled: boolean;
      href: string;
      avatar: string;
      name: string;
      owner: string;
      desc: string;
      callNo: number;
      status: string;
      updatedAt: string;
      createdAt: string;
      progress: number;
    }[];
    /** example: 100 */
    total: number;
    /** example: true */
    success: boolean;
    /** example: 20 */
    pageSize: number;
    /** example: 1 */
    current: number;
  };

  /** POST /api/login/outLogin */
  export type POST_API_LOGIN_OUT_LOGIN_QUERY = {
    /** example:  123 */
    token: string;
  };

  export type POST_API_LOGIN_OUT_LOGIN_PAYLOAD = Record<string, any>;

  export type POST_API_LOGIN_OUT_LOGIN_RES = {
    /** example: {} */
    data: Record<string, any>;
    /** example: true */
    success: boolean;
  };

  /** POST /api/login/account */
  export type POST_API_LOGIN_ACCOUNT_QUERY = {
    /** example:  123 */
    token: string;
  };

  export type POST_API_LOGIN_ACCOUNT_PAYLOAD = {
    /** example: admin */
    username: string;
    /** example: ant.design */
    password: string;
    /** example: true */
    autoLogin: boolean;
    /** example: account */
    type: string;
  };

  export type POST_API_LOGIN_ACCOUNT_RES = {
    /** example: ok */
    status: string;
    /** example: account */
    type: string;
    /** example: admin */
    currentAuthority: string;
  };
}
