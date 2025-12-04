import type {
  CompareCommissionResponse,
  PromotionlinkListV2Request,
  PromotionlinkListV2Response,
  PromotionconfListallRequest,
  PromotionconfListallResponse,
  PromotionmaterialsListallRequest,
  PromotionmaterialsListallResponse,
  ConfigInfoResponse,
  NetcashdashboardInfoV2Query,
  NetcashdashboardInfoV2Response,
  CompareGameDataQuery,
  CompareGameDataResponse,
  ReportsChartsQuery,
  ReportsChartsResponse,
  GameDetailQuery,
  GameDetailResponse,
  PaymentSummaryQuery,
  PaymentSummaryResponse,
  RechargeListQuery,
  RechargeListResponse,
  WithdrawListQuery,
  WithdrawListResponse,
} from './data-contracts'
import type { HttpClient, RequestParams } from './http-client'
import { ContentType } from './http-client'

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
   * 推廣-取得推廣鏈結V2
   */
  getPromoteListV2 = (
    query: PromotionlinkListV2Request,
    params: RequestParams = {},
  ) =>
    this.http.request<PromotionlinkListV2Response, any>({
      path: '/admin/promotionlink/listv2',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })

  /** 推廣素材元素列表 */
  getPromotionconfListall = (
    query: PromotionconfListallRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<PromotionconfListallResponse, any>({
      path: '/admin/promotionconf/listall',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })

  /** 全部推廣素材 */
  getPromotionmaterialsListall = (
    query: PromotionmaterialsListallRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<PromotionmaterialsListallResponse, any>({
      path: '/admin/promotionmaterials/listall',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })
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

  /**
   * 调整佣金
   *
   * @tags Admin
   * @name AdjustCommission
   * @request PUT:/admin/sendcommission/adjustmentcommission
   * @secure
   */
  putAdjustCommission = (
    data: {
      Id: number // 资料id
      UserName: string // 代理账号
      CommissionTotal: number // 佣金总额
      CommissionChangeAmount: number // 调整金额，单位:分
      Remark: string // 调整原因
      IsMulti: number // 多层费率类型0:不查看 1:多层单费率 2:多层多费率(默认:1)
    },
    params: RequestParams = {},
  ) =>
    this.http.request<any, any>({
      path: '/admin/sendcommission/adjustmentcommission',
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 一键发放佣金
   *
   * @tags Admin
   * @name AgentOneKeySend
   * @request POST:/admin/sendcommission/agentonekeysend
   * @secure
   */
  postAgentOneKeySend = (
    data: {
      Ids: string // 资料id数组，以逗号分隔
      IsDeduct: number // 是否抵扣欠款(1:要抵扣欠款)(默认:0)
      IsMulti: number // 多层费率类型0:不查看 1:多层单费率 2:多层多费率(默认:1)
    },
    params: RequestParams = {},
  ) =>
    this.http.request<any, any>({
      path: '/admin/sendcommission/agentonekeysend',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 单个发放佣金
   *
   * @tags Admin
   * @name AgentSendCommission
   * @request POST:/admin/sendcommission/agentsendcommission
   * @secure
   */
  postAgentSendCommission = (
    data: {
      Id: number // 资料id
      IsDeduct: number // 是否抵扣欠款(1:要抵扣欠款)(默认:0)
      IsMulti: number // 多层费率类型0:不查看 1:多层单费率 2:多层多费率(默认:1)
    },
    params: RequestParams = {},
  ) =>
    this.http.request<any, any>({
      path: '/admin/sendcommission/agentsendcommission',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 游戏注单详情
   *
   * @tags Admin
   * @name GameDetail
   * @request GET:/admin/netcashplayergame/gamedetail
   * @secure
   */
  getGameDetail = (
    query: GameDetailQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<GameDetailResponse, any>({
      path: '/admin/netcashplayergame/gamedetail',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 充值/提现总计
   *
   * @tags Admin
   * @name PaymentSummary
   * @request GET:/admin/netcashreportcenter/finance/payment/summary
   * @secure
   */
  getPaymentSummary = (
    query: PaymentSummaryQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<PaymentSummaryResponse, any>({
      path: '/admin/netcashreportcenter/finance/payment/summary',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 充值记录列表
   *
   * @tags Admin
   * @name RechargeList
   * @request GET:/admin/netcashplayergame/commonRechargelist
   * @secure
   */
  getRechargeList = (
    query: RechargeListQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<RechargeListResponse, any>({
      path: '/admin/netcashplayergame/commonRechargelist',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 提现记录列表
   *
   * @tags Admin
   * @name WithdrawList
   * @request GET:/admin/netcashplayergame/commonWithdrawlist
   * @secure
   */
  getWithdrawList = (
    query: WithdrawListQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<WithdrawListResponse, any>({
      path: '/admin/netcashplayergame/commonWithdrawlist',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
}
