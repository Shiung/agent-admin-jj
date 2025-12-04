import type {
  LoginFormData,
  LoginResponse,
  ImageValidCodeResponse,
  VLoginFormData,
  VLoginResponse,
  IsLoginResponse,
  SendPhoneVerifyCodeQuery,
  SendPhoneVerifyCodeResponse,
  SendEmailVerifyCodeQuery,
  SendEmailVerifyCodeResponse
} from './data-contracts'
import type { HttpClient, RequestParams } from './http-client'
import { ContentType } from './http-client'

export class System<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * 帳密登入
   *
   * @tags System
   * @name Login
   * @request POST:/system/user/login
   * @secure
   */
  login = (
    data: LoginFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<LoginResponse, any>({
      path: '/system/user/login',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });

  /**
   * 驗證碼圖片
   *
   * @tags System
   * @name Login
   * @request POST:/system/user/imagevalidcode
   * @secure
   */
  imageValidCode = (
    params: RequestParams = {},
  ) =>
    this.http.request<ImageValidCodeResponse, any>({
      path: '/system/user/imagevalidcode',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * google驗證登入
   *
   * @tags System
   * @name VLogin
   * @request POST:/system/user/vlogin
   * @secure
   */
  vLogin = (
    data: VLoginFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<VLoginResponse, any>({
      path: '/system/user/vlogin',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });

  /**
   * 是否登入
   *
   * @tags System
   * @name VLogin
   * @request POST:/system/user/vlogin
   * @secure
   */
  isLogin = (
    params: RequestParams = {},
  ) =>
    this.http.request<IsLoginResponse, any>({
      path: '/system/user/islogin',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });

  /** 發送手機驗證碼 */
  sendPhoneVerifyCode = (
    query: SendPhoneVerifyCodeQuery,
    params: RequestParams = {},
  ) => 
    this.http.request<SendPhoneVerifyCodeResponse, any>({
      path: '/api/phonevalidcode',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });

  /** 發送手機驗證碼 */
  sendEmailVerifyCode = (
    query: SendEmailVerifyCodeQuery,
    params: RequestParams = {},
  ) => 
    this.http.request<SendEmailVerifyCodeResponse, any>({
      path: '/api/emailvalidcode',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });
}
