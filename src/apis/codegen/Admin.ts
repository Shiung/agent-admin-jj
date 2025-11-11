import type {
  CompareCommissionResponse,
  ConfigInfoResponse,
  NetcashdashboardInfoV2Query,
  NetcashdashboardInfoV2Response,
  CompareGameDataQuery,
  CompareGameDataResponse,
  ReportsChartsQuery,
  ReportsChartsResponse,
} from './data-contracts'
import type { HttpClient, RequestParams } from './http-client'
// import { ContentType } from './http-client'

export class Admin<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * 項目基礎配置
   *
   * @tags Admin
   * @name ConfigInfo
   * @request GET:/admin/config/info
   * @secure
   */
  getConfigInfo = (
    params: RequestParams = {},
  ) =>
    this.http.request<ConfigInfoResponse, any>({
      path: '/admin/config/info',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });

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

    /**
   * 運營數據-月報-日報-資料
   *
   * @tags Admin
   * @name NetcashdashboardInfoV2
   * @request GET:/admin/netcashdashboard/infoV2
   * @secure
   */
  getNetcashdashboardInfoV2 = (
    query: NetcashdashboardInfoV2Query,
    params: RequestParams = {},
  ) =>
    this.http.request<NetcashdashboardInfoV2Response, any>({
      path: '/admin/netcashdashboard/infoV2',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });

  /**
   * 首頁-遊戲數據-包含上月遊戲數據(代理後台重構)
   *
   * @tags Admin
   * @name CompareGameData
   * @request GET:/admin/netcashdashboard/compare/gameData
   * @secure
   */
  getCompareGameData = (
    query: CompareGameDataQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<CompareGameDataResponse, any>({
      path: '/admin/netcashdashboard/compare/gameData',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });
  /**
   * 首頁-遊戲數據-包含上月遊戲數據(代理後台重構)
   *
   * @tags Admin
   * @name CompareGameData
   * @request GET:/admin/netcashdashboard/reports/charts
   * @secure
   */
  getReportsCharts = (
    query: ReportsChartsQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<ReportsChartsResponse, any>({
      path: '/admin/netcashdashboard/reports/charts',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });
}
