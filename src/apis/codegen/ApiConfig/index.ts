import type {
  RechargetypelistResponse
} from '../data-contracts'
import type { HttpClient, RequestParams } from '../http-client'

export class ApiConfig<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;
  
  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /** 獲取充值類型列表 */
  getRechargetypelist = (
    params: RequestParams = {},
  ) =>
    this.http.request<RechargetypelistResponse, any>({
      path: '/api/config/getrechargetypelist',
      method: 'GET',
      secure: true,
      format: "json",
      ...params
    })
  
}