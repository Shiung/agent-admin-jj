import type {
  GamedetailRequest,
  GamedetailResponse,
  CommonRechargelistRequest,
  CommonRechargelistResponse,
  CommonWithdrawlistRequest,
  CommonWithdrawlistResponse,
  RedListRequest,
  RedListResponse,
  AgentapplygoldlistRequest,
  AgentapplygoldlistResponse
} from '../data-contracts'
import type { HttpClient, RequestParams } from '../http-client'

export class NetCashPlayerGame<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;
  
  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /** 管理>會員管理>會員詳情>游戏记录 */
  getGameDetail = (
    query: GamedetailRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<GamedetailResponse, any>({
      path: '/admin/netcashplayergame/gamedetail',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })

  /** 管理>會員管理>會員詳情>充值紀錄 */
  getCommonRechargelist = (
    query: CommonRechargelistRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<CommonRechargelistResponse, any>({
      path: '/admin/netcashplayergame/commonRechargelist',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })

  /** 管理>會員管理>會員詳情>提現紀錄 */
  getCommonWithdrawlist = (
    query: CommonWithdrawlistRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<CommonWithdrawlistResponse, any>({
      path: '/admin/netcashplayergame/commonWithdrawlist',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })

  /** 管理>會員管理>會員詳情>紅利紀錄 */
  getRedlist = (
    query: RedListRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<RedListResponse, any>({
      path: '/admin/netcashplayergame/redlist',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })

  /** 管理>會員管理>會員詳情>代存紀錄 */
  getAgentapplygoldlist = (
    query: AgentapplygoldlistRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<AgentapplygoldlistResponse, any>({
      path: '/admin/netcashplayergame/agentapplygoldlist',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })
}