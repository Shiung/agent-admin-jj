import type { Pagination, BaseResponse, RequestPage } from '../common'
export interface PlayermanagePlayerlistv2Request extends RequestPage {
  /** 註冊開始時間 */
  RegTimeBegin?: number
  /** 註冊結束時間 */
  RegTimeEnd?: number
  /** 統計開始時間 */
  ReportTimeBegin: number
  /** 統計結束時間 */
  ReportTimeEnd: number
  /** 會員ID */
  PlayerId?: number
  /** 包體ID */
  PackageId?: number
  /** 排序欄位，前面帶正負號代表排序方式 */
  Sort?: string
  /** 綁定手機(0,不帶:全部 1:已綁定 2:未綁定) (Allowed values: 0, 1, 2) */
  BindPhone?: 0 | 1 | 2
  /** 綁定銀行卡(0,不帶:全部 1:已綁定 2:未綁定) (Allowed values: 0, 1, 2) */
  BindCard?: 0 | 1 | 2
  /**
   * VIP等級, 多個以逗號分割
   * @example Example : 1,2,3
   **/
  VipLevels?: string
  /** 活躍會員 (Allowed values: 0, 1, 2) */
  ActiveMemberType?: 0 | 1 | 2
}

export interface PlayermanagePlayerlistv2ResponseData {
  Items: Array<{
    /** 代存(分) */
    AgentApplyGold: number
    /** 綁定銀行卡(-1:無權限 1:已綁定 2:未綁定) */
    BindCard: number
    /** 綁定手機(-1:無權限 1:已綁定 2:未綁定) */
    BindPhone: number
    /** 註冊時間 */
    CreateTime: number
    /** 是否為活躍會員 */
    IsActiveMember: boolean
    /** 最後登入時間 */
    LastTime: number
    /** 會員帳號 */
    LoginAccount: string
    /** 包體名稱 */
    PackageName: string
    /** 會員ID */
    PlayerId: number
    /** 充值(分) */
    Recharged: number
    /** VIP等級 */
    VipLevel: string
    /** 盈利(分) */
    WinLose: number
  }>
  Pagination: Pagination
  Total: {
    /** 總代存(分) */
    TotalAgentApplyGold: number
    /** 總充值(分) */
    TotalRecharged: number
    /** 總盈利(分) */
    TotalWinLose: number
  }
}

export type PlayermanagePlayerlistv2Response = BaseResponse<PlayermanagePlayerlistv2ResponseData>

export interface PlayermanageSearchRequest {
  LoginAccount?: string
}

export interface PlayermanageSearchResponseData {
  Items: Array<{
    LoginAccount: string
    PlayerId: number
  }>
}

export type PlayermanageSearchResponse = BaseResponse<PlayermanageSearchResponseData>

export interface PlayermanagePlayerdetailv2Request {
  /** 統計開始時間 (Required) */
  ReportTimeBegin: number
  /** 統計結束時間 (Required) */
  ReportTimeEnd: number
  /** 會員ID (Required) */
  PlayerId: number
}

export interface PlayermanagePlayerdetailv2ResponseData {
  PlayerInfo: {
    /** 綁定銀行卡(-1:無權限 1:已綁定 2:未綁定) */
    BindCard: number
    /** 綁定手機(-1:無權限 1:已綁定 2:未綁定) */
    BindPhone: number
    /** 註冊時間 */
    CreateTime: number
    /** 首存金額(分) */
    FirstPayMoney: number
    /** 首存時間 */
    FirstPayTime: number
    /** 是否為活躍會員 */
    IsActiveMember: boolean
    /** 最後登入時間 */
    LastLoginTime: number
    /** 會員帳號 */
    LoginAccount: string
    /** 包體名稱 */
    PackageName: string
    /** 玩家ID */
    PlayerId: number
    /** VIP等級 */
    VipLevel: string
  }
  Total: {
    /** "總代存(分)" */
    TotalAgentApplyGold: number 
    /** "總返水(分)" */
    TotalBackWater: number
    /** "總投注(分)" */
    TotalBetGold: number
    /** "總充值金額(分)" */
    TotalRecharged: number
    /** "總紅利(分)" */
    TotalRedGold: number
    /** "總有效投注(分)" */
    TotalValidBet: number
    /** "總派彩(分)" */
    TotalWinGold: number
    /** "總提現金額(分)" */
    TotalWithdraw: number
  }
}

export type PlayermanagePlayerdetailv2Response = BaseResponse<PlayermanagePlayerdetailv2ResponseData>

export interface PlayermanageApplylistv2Request extends RequestPage {
  /** 申請起始時間 */
  ApplyTimeBegin?: number
  /** 申請結束時間 */
  ApplyTimeEnd?: number
  /** 會員ID */
  PlayerId?: number
  /** 產品ID */
  PackageId?: number
  /** 狀態(0:全部 1:申請中 2:同意 3:拒絕) (Allowed values: 0, 1, 2, 3) */
  Status?: number
}

interface PlayermanageApplylistv2ResponseData {
  Items: Array<{
    /** 設備類型 */
    ApplyPlatform: string
    /** 申请时间 */
    ApplyTime: number
    /** 綁定渠道號 */
    BindChannelId: string
    /** 備註 */
    Desc: string
    /** 引導連結 */
    GuideUrl: string
    /** 記錄ID */
    Id: number
    /** 會員帳號 */
    LoginAccount: string
    /** 產品名稱 */
    PackageName: string
    /** 會員ID */
    PlayerId: number
    /** 狀態(1:申請中 2:同意 3:拒絕) */
    Status: 1 | 2 | 3
    /** VIP等級 */
    VipLevel: number
  }>
  Pagination: Pagination
  Total: {
    /** 通過會員總數 */
    TotalApproved: number
  }
}

export type PlayermanageApplylistv2Response = BaseResponse<PlayermanageApplylistv2ResponseData>

export interface PlayermanageApplycheckRequest {
  /** 會員帳號 (Required) */
  LoginAccount: string
  /** 產品ID (Required) */
  PackageId: number
}

export interface PlayermanageApplycheckResponseData {
  Items: Array<{
    /** 代理ID */
    AdminId: number
    /** 建立時間 */
    CreateTime: number
    /** 會員帳號 */
    LoginAccount: string
    /** 產品名稱 */
    PackageName: string
    /** 會員ID */
    PlayerId: number
  }>
}

export type PlayermanageApplycheckResponse = BaseResponse<PlayermanageApplycheckResponseData>

export interface PlayermanageApplyRequest {
  /** 上傳圖片，多個用逗號分割 */
  Image?: string
  /** 會員ID */
  PlayerId: number
  /** 引導連結(必填) (Required) */
  Url: string
  /** 綁定渠道號(必填) (Required) */
  ChannelId: string
  /** 設備類型(android,ios,h5,pc) (Allowed values: android, ios, h5, pc) */
  Platform?: string
  /** 備註(最多1024字) (Maximum: 1024) */
  Desc?: string
  /** 產品ID (Required) */
  PackageId: number
  /** 會員帳號 (Required) */
  LoginAccount: string
}

export type PlayermanageApplyResponse = BaseResponse

export interface PlayermanagePlayerchannelv2Request {
  /** 會員ID (Required)  */
  PlayerId: number
}

export interface PlayermanagePlayerchannelv2ResponseData {
  Items: Array<{
    /** 代理ID */
    AdminId: number
    /** 渠道號 */
    ChannelId: string
    /** 渠道名稱 */
    ChannelName: string
    /** 代理名稱 */
    Name: string
    /** 代理帳號 */
    UserName: string
  }>
}

export type PlayermanagePlayerchannelv2Response = BaseResponse<PlayermanagePlayerchannelv2ResponseData>
