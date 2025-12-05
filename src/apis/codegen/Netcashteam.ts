import type {
  GetNetcashteamInfoResponse,
  NetcashteamListV2Query,
  GetNetcashteamListV2Response,
  NetcashteamSearchQuery,
  GetNetcashteamSearchResponse,
} from './data-contracts'
import type { HttpClient, RequestParams } from './http-client'

export class Netcashteam<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * 管理>團隊管理>團隊資訊
   *
   * @tags Netcashteam
   * @name GetNetcashteamInfo
   * @request GET:/admin/netcashteam/info
   * @secure
   */
  getNetcashteamInfo = (
    params: RequestParams = {},
  ) =>
    this.http.request<GetNetcashteamInfoResponse, any>({
      path: '/admin/netcashteam/info',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 管理>團隊管理>團隊列表
   *
   * @tags Netcashteam
   * @name GetNetcashteamListV2
   * @request GET:/admin/netcashteam/listv2
   * @secure
   */
  getNetcashteamListV2 = (
    query: NetcashteamListV2Query,
    params: RequestParams = {},
  ) =>
    this.http.request<GetNetcashteamListV2Response, any>({
      path: '/admin/netcashteam/listv2',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });

  /**
   * 管理>團隊管理>團隊代理搜尋
   *
   * @tags Netcashteam
   * @name GetNetcashteamSearchAdmin
   * @request GET:/admin/netcashteam/searchadmin
   * @secure
   */
  getNetcashteamSearchAdmin = (
    query: NetcashteamSearchQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<GetNetcashteamSearchResponse, any>({
      path: '/admin/netcashteam/searchadmin',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });

}
