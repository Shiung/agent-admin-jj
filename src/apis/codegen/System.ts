import type {
  LoginFormData,
  LoginResponse,
  ImageValidCodeResponse,
  VLoginFormData,
  VLoginResponse,
  IsLoginResponse,
  PhoneVerifyResponse,
  EmailVerifyResponse,
  GoogleCodeResponse,
  SendPhoneVerifyCodeQuery,
  SendPhoneVerifyCodeResponse,
  SendEmailVerifyCodeQuery,
  UploadImageMd5Response,
  SendEmailVerifyCodeResponse,
  Registerv2FormData,
  Registerv2Response,
  PhoneRegisterv2FormData,
  EmailRegisterv2FormData,
  PhoneSendCodeQuery,
  EmailSendCodeQuery,
  GoogleLoginAuthFormData,
  GoogleLoginAuthResponse,
  GoogleLoginAuthBindFormData,
  GoogleLoginAuthBindResponse,
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

  /**
   * 手機號碼驗證
   *
   * @tags System
   * @name PhoneVerify
   * @request GET:/api/phonevalidcode/
   * @secure
   */
  phoneVerify = (
    query: {
      Number: string;
      DeviceId: string;
      OpType: number;
    },
    params: RequestParams = {},
  ) =>
    this.http.request<PhoneVerifyResponse, any>({
      path: '/api/phonevalidcode/',
      method: 'GET',
      secure: true,
      format: 'json',
      query,
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

  /**
   * 手機驗證碼(需要驗證彈窗)
   *
   * @tags System
   * @name PhoneSendCode
   * @request POST:/api/phonesendcode/
   * @secure
   */
  phoneSendCode = (
    query: PhoneSendCodeQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<IsLoginResponse, any>({
      path: '/api/phonesendcode/',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });

  /** 郵件獲取驗證碼 */
  emailVerify = (
    query: {
      Email: string;
      DeviceId?: string;
      OpType?: number;
    },
    params: RequestParams = {},
  ) =>
    this.http.request<EmailVerifyResponse, any>({
      path: '/api/emailvalidcode/',
      method: 'GET',
      secure: true,
      format: 'json',
      query,
      ...params,
    });

  /**
   * 谷歌验证
   *
   * @tags System
   * @name GoogleCode
   * @request POST:/system/user/getgoogleauthsecret
   * @secure
   */
  googleCode = (
    query: {
      Username: string;
    },
    params: RequestParams = {},
  ) =>
    this.http.request<GoogleCodeResponse, any>({
      path: '/system/user/getgoogleauthsecret',
      method: 'POST',
      secure: true,
      format: 'json',
      query,
      ...params,
    });

  /** 發送郵件驗證碼 */
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

  /**
   * email驗證碼(需要驗證彈窗)
   *
   * @tags System
   * @name EmailSendCode
   * @request POST:/api/emailsendcode/
   * @secure
   */
  emailSendCode = (
    query: EmailSendCodeQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<IsLoginResponse, any>({
      path: '/api/emailsendcode/',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });

  /**
   * 一般註冊
   *
   * @tags System
   * @name Registerv2
   * @request POST:/api/netcashregister/registerv2
   * @secure
   */
  registerv2 = (
    data: Registerv2FormData,
    params: RequestParams = {},
  ) =>
    this.http.request<Registerv2Response, any>({
      path: '/api/netcashregister/registerv2',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });

  /**
   * 手機驗證註冊
   *
   * @tags System
   * @name PhoneRegisterv2
   * @request POST:/api/netcashregister/phoneregisterv2
   * @secure
   */
  phoneRegisterv2 = (
    data: PhoneRegisterv2FormData,
    params: RequestParams = {},
  ) =>
    this.http.request<Registerv2Response, any>({
      path: '/api/netcashregister/phoneregisterv2',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });

  /**
   * email驗證註冊
   *
   * @tags System
   * @name EmailRegisterv2
   * @request POST:/api/netcashregister/emailregisterv2
   * @secure
   */
  emailRegisterv2 = (
    data: EmailRegisterv2FormData,
    params: RequestParams = {},
  ) =>
    this.http.request<Registerv2Response, any>({
      path: '/api/netcashregister/emailregisterv2',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });

  /** 圖片上傳 */
  uploadImageMd5 = (
    data: {
      upfile: File
    },
    params: RequestParams = {},
  ) => 
    this.http.request<UploadImageMd5Response, any>({
      path: '/api/resource/uploadimagemd5',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });

  /** google驗證登入綁定資訊 */
  googleLoginAuth = (
    data: GoogleLoginAuthFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<GoogleLoginAuthResponse, any>({
      path: '/system/user/googleloginauth',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });

  /** google驗證綁定 */
  googleLoginAuthBind = (
    data: GoogleLoginAuthBindFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<GoogleLoginAuthBindResponse, any>({
      path: '/system/user/googleloginauthbind',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });
}
