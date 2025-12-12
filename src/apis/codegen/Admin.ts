import type {
  CompareCommissionResponse,
  PromotionlinkListV2Request,
  PromotionlinkListV2Response,
  PromotionconfListallRequest,
  PromotionconfListallResponse,
  PromotionmaterialsListallRequest,
  PromotionmaterialsListallResponse,
  ConfigInfoResponse,
  SystemConfigRequest,
  SystemConfigResponse,
  AccountInfoResponse,
  NetcashdashboardInfoV2Query,
  NetcashdashboardInfoV2Response,
  CompareGameDataQuery,
  CompareGameDataResponse,
  ReportsChartsQuery,
  ReportsChartsResponse,
  MineResponse,
  HelpCenterListResponse,
  LoginSettingRequest,
  GameDetailQuery,
  GameDetailResponse,
  PaymentSummaryQuery,
  PaymentSummaryResponse,
  RechargeListQuery,
  RechargeListResponse,
  WithdrawListQuery,
  WithdrawListResponse,
  PayRecordsQuery,
  PayRecordsResponse,
  WithdrawRecordsQuery,
  WithdrawRecordsResponse,
  PayMoneyWithdrawFeeDetailsQuery,
  PayMoneyWithdrawFeeDetailsResponse,
  WithdrawAccountResponse,
  AgentApplyGoldQuery,
  AgentApplyGoldResponse,
  AgentApplyGoldSummaryResponse,
  BonusRecordQuery,
  BonusRecordResponse,
  BonusSummaryResponse,
  MemberFinanceReportQuery,
  MemberFinanceReportResponse,
  MemberFinanceReportTotalQuery,
  MemberFinanceReportTotalResponse,
  SubAgentListResponse,
  LoginPasswordRequest,
  PrivatePasswordV2Request,
  BindingPhoneVerifyRequest,
  CommissionToQuotaRequest,
  CommissionToQuotaResponse,
  CommissionToQuotaTotalQuery,
  CommissionToQuotaTotalResponse,
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

  /** 取得通用配置 */
  getSystemConfig = (
    query: SystemConfigRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<SystemConfigResponse, any>({
      path: '/api/showtheme/config',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });

  /** 取得個人資料 */
  getAccountInfo = (
    params: RequestParams = {},
  ) =>
    this.http.request<AccountInfoResponse, any>({
      path: '/admin/personalcenter/info',
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

  /**
   * 充值手续费记录列表
   *
   * @tags Admin
   * @name PayRecords
   * @request GET:/admin/netcashreportcenter/payrecords
   * @secure
   */
  getPayRecords = (
    query: PayRecordsQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<PayRecordsResponse, any>({
      path: '/admin/netcashreportcenter/payrecords',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 提现手续费记录列表
   *
   * @tags Admin
   * @name WithdrawRecords
   * @request GET:/admin/netcashreportcenter/withdrawrecords
   * @secure
   */
  getWithdrawRecords = (
    query: WithdrawRecordsQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<WithdrawRecordsResponse, any>({
      path: '/admin/netcashreportcenter/withdrawrecords',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 充提手续费总计详情
   *
   * @tags Admin
   * @name PayMoneyWithdrawFeeDetails
   * @request GET:/admin/netcashreportcenter/paymoneywithdrawfeedetails
   * @secure
   */
  getPayMoneyWithdrawFeeDetails = (
    query: PayMoneyWithdrawFeeDetailsQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<PayMoneyWithdrawFeeDetailsResponse, any>({
      path: '/admin/netcashreportcenter/paymoneywithdrawfeedetails',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 更新真實姓名
   *
   * @tags Admin
   * @name UpdateRealName
   * @request POST:/admin/accountlogin/realname
   * @secure
   */
  updateRealName = (
    data: { RealName: string },
    params: RequestParams = {},
  ) =>
    this.http.request<MineResponse, any>({
      path: '/admin/accountlogin/realname',
      method: "POST",
      secure: true,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 更新代理昵稱
   *
   * @tags Admin
   * @name UpdateName
   * @request POST:/admin/accountlogin/name
   * @secure
   */
  updateName = (
    data: { Name: string },
    params: RequestParams = {},
  ) =>
    this.http.request<MineResponse, any>({
      path: '/admin/accountlogin/name',
      method: "POST",
      secure: true,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 更新手機號
   *
   * @tags Admin
   * @name UpdatePhone
   * @request POST:/admin/accountlogin/phone
   * @secure
   */
  updatePhone = (
    data: BindingPhoneVerifyRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<MineResponse, any>({
      path: '/admin/accountlogin/phone',
      method: "POST",
      secure: true,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 更新郵箱
   *
   * @tags Admin
   * @name UpdateEmail
   * @request POST:/admin/accountlogin/email
   * @secure
   */
  updateEmail = (
    data: { Email: string; VerifyCode: string },
    params: RequestParams = {},
  ) =>
    this.http.request<MineResponse, any>({
      path: '/admin/accountlogin/email',
      method: "POST",
      secure: true,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 更新谷歌驗證
   *
   * @tags Admin
   * @name UpdateGoogleCode
   * @request POST:/admin/accountlogin/google
   * @secure
   */
  updateGoogleCode = (
    data: { Username: string; Code: string },
    params: RequestParams = {},
  ) =>
    this.http.request<MineResponse, any>({
      path: '/admin/accountlogin/google',
      method: "POST",
      secure: true,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 更新QQ
   *
   * @tags Admin
   * @name UpdateQQ
   * @request POST:/admin/personalcenter/
   * @secure
   */
  updateQQ = (
    data: { QQ: string },
    params: RequestParams = {},
  ) =>
    this.http.request<MineResponse, any>({
      path: '/admin/personalcenter/',
      method: "POST",
      secure: true,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 幫助中心列表
   *
   * @tags Admin
   * @name GetHelpList
   * @request GET:/admin/helpcenter/list
   * @secure
   */
  getHelpList = (
    query: { Page: number; PageSize: number },
    params: RequestParams = {},
  ) =>
    this.http.request<HelpCenterListResponse, any>({
      path: '/admin/helpcenter/list',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });

  /**
   * 更新登录设置
   *
   * @tags Admin
   * @name UpdateLoginSetting
   * @request POST:/admin/accountlogin/loginsetting
   * @secure
   */
  updateLoginSetting = (
    data: LoginSettingRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<MineResponse, any>({
      path: '/admin/accountlogin/loginsetting',
      method: "POST",
      secure: true,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 更新登录密码
   *
   * @tags Admin
   * @name UpdateLoginPassword
   * @request POST:/admin/accountlogin/password
   * @secure
   */
  updateLoginPassword = (
    data: LoginPasswordRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<MineResponse, any>({
      path: '/admin/accountlogin/password',
      method: "POST",
      secure: true,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * 更新私人密码
   *
   * @tags Admin
   * @name UpdatePrivatePassword
   * @request POST:/admin/accountlogin/privatepasswordv2
   * @secure
   */
  updatePrivatePasswordV2 = (
    data: PrivatePasswordV2Request,
    params: RequestParams = {},
  ) =>
    this.http.request<MineResponse, any>({
      path: '/admin/accountlogin/privatepasswordv2',
      method: "POST",
      secure: true,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /** 取得提現帳號 */
  getWithdrawAccount = (
    params: RequestParams = {},
  ) =>
    this.http.request<WithdrawAccountResponse, any>({
      path: '/admin/personalcenter/agentnetcashcard',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * 代存记录列表
   *
   * @tags Admin
   * @name AgentApplyGold
   * @request GET:/admin/netcashreportcenter/finance/agentapplygold
   * @secure
   */
  getAgentApplyGold = (
    query: AgentApplyGoldQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<AgentApplyGoldResponse, any>({
      path: '/admin/netcashreportcenter/finance/agentapplygold',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 代存记录总计
   *
   * @tags Admin
   * @name AgentApplyGoldSummary
   * @request GET:/admin/netcashreportcenter/finance/agentapplygold/summary
   * @secure
   */
  getAgentApplyGoldSummary = (
    query: {
      BeginTime: number,
      EndTime: number,
    },
    params: RequestParams = {},
  ) =>
    this.http.request<AgentApplyGoldSummaryResponse, any>({
      path: '/admin/netcashreportcenter/finance/agentapplygold/summary',
      method: "GET",
      secure: true,
      query,
      ...params,
    });

  /**
   * 红利记录列表
   *
   * @tags Admin
   * @name BonusRecord
   * @request GET:/admin/netcashplayergame/redlist
   * @secure
   */
  getBonusRecord = (
    query: BonusRecordQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<BonusRecordResponse, any>({
      path: '/admin/netcashplayergame/redlist',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 红利记录总计
   *
   * @tags Admin
   * @name BonusSummary
   * @request GET:/admin/netcashreportcenter/finance/bonus/summary
   * @secure
   */
  getBonusSummary = (
    query: {
      BeginTime: number,
      EndTime: number,
    },
    params: RequestParams = {},
  ) =>
    this.http.request<BonusSummaryResponse, any>({
      path: '/admin/netcashreportcenter/finance/bonus/summary',
      method: "GET",
      secure: true,
      query,
      ...params,
    });

  /**
   * 会员财务报表
   *
   * @tags Admin
   * @name MemberFinanceReport
   * @request GET:/admin/netcashreportcenter/personalfinancereport
   * @secure
   */
  getMemberFinanceReport = (
    query: MemberFinanceReportQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<MemberFinanceReportResponse, any>({
      path: '/admin/netcashreportcenter/personalfinancereport',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 会员财务报表总计
   *
   * @tags Admin
   * @name MemberFinanceReportTotal
   * @request GET:/admin/netcashreportcenter/personalfinancereporttotal
   * @secure
   */
  getMemberFinanceReportTotal = (
    query: MemberFinanceReportTotalQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<MemberFinanceReportTotalResponse, any>({
      path: '/admin/netcashreportcenter/personalfinancereporttotal',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * @description 获取下级代理列表
   * @name getSubAgentList
   * @summary 获取下级代理列表
   * @request GET:/admin/netcashreportcenter/personaldownlineadmins
   * @secure
   */
  getSubAgentList = (params: RequestParams = {}) =>
    this.http.request<SubAgentListResponse, any>({
      path: '/admin/netcashreportcenter/personaldownlineadmins',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 佣金转额度
   *
   * @tags Admin
   * @name CommissionToQuota
   * @request POST:/admin/agentcreditlimittransaction/commissiontoquota
   * @secure
   */
  postCommissionToQuota = (data: CommissionToQuotaRequest, params: RequestParams = {}) =>
    this.http.request<CommissionToQuotaResponse, any>({
      path: '/admin/agentcreditlimittransaction/commissiontoquota',
      method: "POST",
      secure: true,
      body: data,
      format: "json",
      ...params,
    });

  /**
   * 佣金轉额度 - 转换记录
   *
   * @tags Admin
   * @name CommissionToQuotaTotal
   * @request GET:/admin/financecenter/paymentwalletdetaillist
   * @secure
   */
  getCommissionToQuotaTotal = (query: CommissionToQuotaTotalQuery, params: RequestParams = {}) =>
    this.http.request<CommissionToQuotaTotalResponse, any>({
      path: '/admin/financecenter/paymentwalletdetaillist',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params
    })
}
