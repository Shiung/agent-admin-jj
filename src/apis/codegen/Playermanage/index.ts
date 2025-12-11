import type {
  PlayermanagePlayerlistv2Request,
  PlayermanagePlayerlistv2Response,
  PlayermanageSearchRequest,
  PlayermanageSearchResponse,
  PlayermanagePlayerdetailv2Request,
  PlayermanagePlayerdetailv2Response,
  PlayermanageApplylistv2Request,
  PlayermanageApplylistv2Response
} from '../data-contracts'
import type { HttpClient, RequestParams } from '../http-client'

export class PlayerManage<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;
  
  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /** 管理>會員管理>會員列表V2 */
  getPlayerListv2 = (
    query: PlayermanagePlayerlistv2Request,
    params: RequestParams = {},
  ) =>
    this.http.request<PlayermanagePlayerlistv2Response, any>({
      path: '/admin/playermanage/playerlistv2',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })

  /** 管理>會員管理>會員搜尋 */
  getPlayerSearch = (
    query: PlayermanageSearchRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<PlayermanageSearchResponse, any>({
      path: '/admin/playermanage/search',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })

  /** 管理>會員管理>會員詳情V2 */
  getPlayerdetailv2 = (
    query: PlayermanagePlayerdetailv2Request,
    params: RequestParams = {},
  ) =>
    this.http.request<PlayermanagePlayerdetailv2Response, any>({
      path: '/admin/playermanage/playerdetailv2',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })

  /** 管理>會員管理>調線記錄V2 */
  getApplylistv2 = (
    query: PlayermanageApplylistv2Request,
    params: RequestParams = {},
  ) =>
    this.http.request<PlayermanageApplylistv2Response, any>({
      path: '/admin/playermanage/applylistv2',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })
}