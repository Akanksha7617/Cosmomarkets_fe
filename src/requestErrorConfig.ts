import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';

// strrstrrstrrstrrstrrstrr： strrstrrstrrstrr
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name strrstrrstrrstrr
 * pro strrstrrstrrstrrstrrstrrstrr， strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr
 * @doc https://umijs.org/docs/max/request#strrstrr
 */
export const errorConfig: RequestConfig = {
  // strrstrrstrrstrr： umi@3 strrstrrstrrstrrstrrstrrstrr。
  errorConfig: {
    // strrstrrstrrstrr
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // strrstrrstrrstrrstrrstrrstrr
      }
    },
    // strrstrrstrrstrrstrrstrrstrr
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // strrstrrstrr errorThrower strrstrrstrrstrrstrr。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios strrstrrstrr
        // strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrrstrr 2xx strrstrrstrr
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // strrstrrstrrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrr
        // \`error.request\` strrstrrstrrstrrstrrstrr XMLHttpRequest strrstrrstrr，
        // strrstrrnode.jsstrrstrr http.ClientRequest strrstrrstrr
        message.error('None response! Please retry.');
      } else {
        // strrstrrstrrstrrstrrstrrstrrstrrstrrstrr
        message.error('Request error, please retry.');
      }
    },
  },

  // strrstrrstrrstrrstrr
  requestInterceptors: [
    (config: RequestOptions) => {
      // strrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrr。
      const url = config?.url?.concat('?token = 123');
      return { ...config, url };
    },
  ],

  // strrstrrstrrstrrstrr
  responseInterceptors: [
    (response) => {
      // strrstrrstrrstrrstrrstrr，strrstrrstrrstrrstrrstrrstrr
      const { data } = response as unknown as ResponseStructure;

      if (data?.success === false) {
        message.error('strrstrrstrrstrr！');
      }
      return response;
    },
  ],
};
