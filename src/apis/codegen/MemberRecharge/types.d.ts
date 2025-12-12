import type { Pagination, BaseResponse } from '../common'
export interface GetPlayerByLoginAccountQuery {
  /** 會員帳號 */
  LoginAccount: string
  /** 產品名稱 */
  PackageName: string
}

export type GetPlayerByLoginAccountResponse = BaseResponse<GetPlayerByLoginAccountResponseData>

export interface GetPlayerByLoginAccountResponseData {
  LoginAccount: string
  PackageName: string
  PromoterUserName: string
  PlayerId: number
  Status: number
  DataFlag: number
  AgentId: number
  PromoterUserId: number
}

export interface WhatsAppGroupListQuery {
  Page: number
  PageSize: number
  GroupType: number
  BotStatus: number
}

export type WhatsAppGroupListResponse = BaseResponse<WhatsAppGroupListResponseData>

export interface WhatsAppGroupListResponseData {
  Items: {
    AgentId: number
    BindToken: string
    BotStatus: number
    CreateTime: number
    Deleted: number
    GroupType: number
    Id: number
    Member: number
    Remark: string
    Title: string
    UpdateTime: number
    WhatsAppGroupId: string
  }[]
}

export interface CreateMemberRechargeOrderFormData {
  /** 產品包名稱 */
  PackageName: string
  /** 會員帳號 */
  LoginAccount: string
  /** 金額 */
  Amount?: number
  /** 上傳憑證 */
  ImageUrls: string
  /** 通知群組ID */
  NotifyRoomId: number
  /** 會員PlayerId */
  PlayerId: number
  /** 備註 */
  Remark?: string
}

export type CreateMemberRechargeOrderResponse = BaseResponse<string>

export interface MemberRechargeOrderStatusQuery {
  /**  '':全部狀態, 1:發送中, 2:發送成功, 3:發送失敗, 4:已建單, 5:審核中 */
  MsgStatus?: string | number
  /** 開始時間 */
  BeginTime?: number
  /** 結束時間 */
  EndTime?: number
  /** 輸入匡輸入會員帳號 */
  TargetUser?: string
  /** 先固定帶 "1," 1-代理後台發起的幣商充值請求 */
  DataType: '1'
  Page: number
  PageSize: number
}

export type MemberRechargeOrderStatusResponse = BaseResponse<MemberRechargeOrderStatusResponseData>

export interface MemberRechargeOrderStatusResponseData {
  Items: {
    CreateTime: number
    PlatformUuid: string
    PackageName: string
    NotifyGroup: string
    [key: string]: any
  }[]
  Pagination: Pagination
}

export interface MemberRechargeOrderListQuery {
  /**  '':全部狀態, 0:待批准, 1:已完成, 2:拒絕, 3:處理中, 4:充值失敗 */
  Status?: string | number
  /** 開始時間 */
  BeginTime?: number
  /** 結束時間 */
  EndTime?: number
  Page: number
  PageSize: number
}

export type MemberRechargeOrderListResponse = BaseResponse<MemberRechargeOrderListResponseData>

export interface MemberRechargeOrderListResponseData {
  Items: {
    CreateTime: number
    PlatformUuid: string
    PackageName: string
    NotifyGroup: string
    [key: string]: any
  }[]
  Pagination: Pagination
}