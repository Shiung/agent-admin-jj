import type {
  CompareCommissionResponse
} from './data-contracts'
import type { HttpClient, RequestParams } from './http-client'
// import { ContentType } from './http-client'

export class Admin<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * 首頁-本期佣金-包含上月佣金資料(代理後台重構
   *
   * @tags Admin
   * @name CompareCommission
   * @request GET:/admin/netcashdashboard/compare/commission
   * @secure
   */
  getCompareCommission = (
    params: RequestParams = {},
  ) =>
    this.http.request<CompareCommissionResponse, any>({
      path: '/admin/netcashdashboard/compare/commission',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });

}
