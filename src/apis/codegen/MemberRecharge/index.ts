import type {
  GetPlayerByLoginAccountQuery,
  GetPlayerByLoginAccountResponse,
  WhatsAppGroupListQuery,
  WhatsAppGroupListResponse,
  CreateMemberRechargeOrderFormData,
  CreateMemberRechargeOrderResponse,
  MemberRechargeOrderStatusQuery,
  MemberRechargeOrderStatusResponse,
  MemberRechargeOrderListQuery,
  MemberRechargeOrderListResponse
} from '../data-contracts'
import type { HttpClient, RequestParams } from '../http-client'
import { ContentType } from '../http-client'

export class MemberRecharge<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /** 根據帳號和產品查詢當前會員ID */
  getPlayerByLoginAccount = (
    query: GetPlayerByLoginAccountQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<GetPlayerByLoginAccountResponse, any>({
      path: '/admin/gamepaymentorder/getplayerbyloginaccount',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** 取得WhatsApp群組 */
  getWhatsAppGroupList = (
    query: WhatsAppGroupListQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<WhatsAppGroupListResponse, any>({
      path: '/admin/gamepaymentorder/getwhatsappgrouplist',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** 發起會員充值訂單 */
  createMemberRechargeOrder = (
    data: CreateMemberRechargeOrderFormData,
    params: RequestParams = {},
  ) =>
    this.http.request<CreateMemberRechargeOrderResponse, any>({
      path: '/admin/gamepaymentorder/createorder',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    })

  /** 取得會員充值記錄-訂單狀態 */
  getMemberRechargeOrderStatus = (
    query: MemberRechargeOrderStatusQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<MemberRechargeOrderStatusResponse, any>({
      path: '/admin/gamepaymentorder/getnotifymessagelist',
      method: "GET",
      secure: true,
      query,
      ...params,
    })

  /** 取得會員充值記錄-充值記錄 */
  getMemberRechargeOrderList = (
    query: MemberRechargeOrderListQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<MemberRechargeOrderListResponse, any>({
      path: '/admin/gamepaymentorder/coindealerselllist',
      method: "GET",
      secure: true,
      query,
      ...params,
    })
}