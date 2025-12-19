import type {
  CommissionOverviewResponse,
  WithdrawAllowedListResponse,
  BankCardAccountListQuery,
  BankCardAccountListResponse,
  AddBankCardAccountFormData,
  AddBankCardAccountResponse,
  DeleteBankCardAccountResponse,
  CryptoAccountListQuery,
  CryptoAccountListResponse,
  AddCryptoAccountFormData,
  AddCryptoAccountResponse,
  DeleteCryptoAccountResponse,
  AppliedAmountQuery,
  AppliedAmountResponse,
  WithdrawUSDTRateQuery,
  WithdrawUSDTRateResponse,
  DDBWalletConfigQuery,
  DDBWalletConfigResponse,
  DDBBalanceQuery,
  DDBBalanceResponse,
  DDBAddressResponse,
  WithdrawMoneyFormData,
  WithdrawMoneyResponse,
  WithdrawRecordConfigResponse,
  WithdrawRecordListQuery,
  WithdrawRecordListResponse,
  AccountBalanceResponse,
  RechargeAllowedListResponse,
  RechargeMoneyFormData,
  RechargeMoneyResponse,
  RechargeMoneyCancelFormData,
  RechargeMoneyCancelResponse,
  RechargeRecordListQuery,
  RechargeRecordListResponse,
  RechargeUSDTRateFormData,
  RechargeUSDTRateResponse
} from '../data-contracts'
import type { HttpClient, RequestParams } from '../http-client'
import { ContentType } from '../http-client'

export class Finance<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /** ＝＝＝佣金钱包 - 提现 ＝＝＝  */
  /** 佣金钱包概览 */
  getCommissionOverview = (
    params: RequestParams = {},
  ) =>
    this.http.request<CommissionOverviewResponse, any>({
      path: '/admin/financecenter/overview',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    })

  /** 提现方式列表 */
  getWithdrawAllowedList = (
    params: RequestParams = {},
  ) =>
    this.http.request<WithdrawAllowedListResponse, any>({
      path: '/admin/agentnetcashwithdrawpaytypeconfig/getallowedlist',
      method: "GET",
      secure: true,
      ...params,
    })

  /** 取得银行卡/支付宝列表 */
  getBankCardAccountList = (
    query: BankCardAccountListQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<BankCardAccountListResponse, any>({
      path: '/admin/agentnetcashbankcard/list',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** 添加银行卡/支付宝账号 */
  addBankCardAccount = (
    data: AddBankCardAccountFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<AddBankCardAccountResponse, any>({
      path: '/admin/agentnetcashbankcard',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    })

  /** 删除银行卡/支付宝账号 */
  deleteBankCardAccount = (
    query: {
      Id: string | number,
    },
    params: RequestParams = {},
  ) =>
    this.http.request<DeleteBankCardAccountResponse, any>({
      path: `/admin/agentnetcashbankcard/${query.Id}`,
      method: "DELETE",
      secure: true,
      ...params,
    })

  /** 取得虚拟币账号列表 */
  getCryptoAccountList = (
    query: CryptoAccountListQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<CryptoAccountListResponse, any>({
      path: '/admin/agentnetcashdigitaladdress/list',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** 添加虚拟币账号 */
  addCryptoAccount = (
    data: AddCryptoAccountFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<AddCryptoAccountResponse, any>({
      path: '/admin/agentnetcashdigitaladdress',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    })

  /** 删除虚拟币账号 */
  deleteCryptoAccount = (
    query: {
      Id: string | number,
    },
    params: RequestParams = {},
  ) =>
    this.http.request<DeleteCryptoAccountResponse, any>({
      path: `/admin/agentnetcashdigitaladdress/${query.Id}`,
      method: "DELETE",
      secure: true,
      ...params,
    })

  /** 取得当日已提现金额 */
  getAppliedAmount = (
    query: AppliedAmountQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<AppliedAmountResponse, any>({
      path: '/admin/agentnetcashwithdraw/appliedamount',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** 取得提现USDT汇率 */
  getWithdrawUSDTRate = (
    query: WithdrawUSDTRateQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<WithdrawUSDTRateResponse, any>({
      path: '/admin/agentnetcashwithdraw/usdtrate',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** 取得DDB设定 */
  getDDBWalletConfig = (
    query: DDBWalletConfigQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<DDBWalletConfigResponse, any>({
      path: '/admin/agentnetcashddb/ddconfig/v2',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** 取得DDB余额 */
  getDDBBalance = (
    query: DDBBalanceQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<DDBBalanceResponse, any>({
      path: '/admin/agentnetcashddb/ddbalance',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** 重刷DDB地址 */
  getDDBAddress = (
    params: RequestParams = {},
  ) =>
    this.http.request<DDBAddressResponse, any>({
      path: '/admin/agentnetcashddb/ddbaddress',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    })

  /** 提现 */
  withdrawMoney = (
    data: WithdrawMoneyFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<WithdrawMoneyResponse, any>({
      path: '/admin/agentnetcashwithdraw/withdraw',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    })

  /** 提现记录查询配置 (云平台 > 代理管理 > 代理提现 > 通用规则配置) */
  getWithdrawRecordConfig = (
    params: RequestParams = {},
  ) =>
    this.http.request<WithdrawRecordConfigResponse, any>({
      path: '/admin/agentnetcashwithdrawconfig/getwithdrawrecordconfig',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    })

  /** 取得提现记录 */
  getWithdrawRecordList = (
    query: WithdrawRecordListQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<WithdrawRecordListResponse, any>({
      path: '/admin/agentnetcashwithdraw/agentwithdrawlist',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** ＝＝＝額度錢包 - 充值＝＝＝  */
  /** 获取额度钱包(代理钱包)余额 */
  getAccountBalance = (
    params: RequestParams = {},
  ) =>
    this.http.request<AccountBalanceResponse, any>({
      path: '/admin/netcashaccount/accountbalance',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    })

  /** 充值方式列表 */
  getRechargeAllowedList = (
    params: RequestParams = {},
  ) =>
    this.http.request<RechargeAllowedListResponse, any>({
      path: '/admin/agentnetcashrechargepaytypeconfig/getallowedlist',
      method: "GET",
      secure: true,
      ...params,
    })

  /** 充值 */
  rechargeMoney = (
    data: RechargeMoneyFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<RechargeMoneyResponse, any>({
      path: '/admin/agentnetcashrecharge/thirdrecharge',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    })

  /** 充值取消訂單 */
  rechargeMoneyCancel = (
    data: RechargeMoneyCancelFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<RechargeMoneyCancelResponse, any>({
      path: '/admin/agentnetcashrecharge/cancelorder',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    })

  /** 取得充值记录(检查充值订单也是这只) */
  getRechargeRecordList = (
    query: RechargeRecordListQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<RechargeRecordListResponse, any>({
      path: '/admin/agentnetcashrecharge/rechargelist',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** 取得充值USDT汇率 */
  getRechargeUSDTRate = (
    data: RechargeUSDTRateFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<RechargeUSDTRateResponse, any>({
      path: '/admin/agentnetcashrecharge/usdtrate',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    })
}
