import type {
  RechargeTypeListResponse,
} from './data-contracts'
import type { HttpClient, RequestParams } from './http-client'

export class Config<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * 获取充值类型列表
   *
   * @tags Config
   * @name GetRechargeTypeList
   * @request GET:/api/config/getrechargetypelist
   * @secure
   */
  getRechargeTypeList = (
    params: RequestParams = {},
  ) =>
    this.http.request<RechargeTypeListResponse, any>({
      path: '/api/config/getrechargetypelist',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
