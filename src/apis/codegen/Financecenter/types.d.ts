import type { Pagination, BaseResponse, RequestPage } from '../common'

type FinancecenterDetaillist = {
  /** 帳變金額 */
  AdjustAmount: number
  /** 帳變後金額 */
  AdjustAmountAft: number
  /** 帳變前金額 */
  AdjustAmountBef: number
  /** 申請備註 */
  ApplyNote: string
  /** 金幣帳變類型 */
  BillType: number
  /** 創建時間 */
  CreateTime: number
  /** 唯一ID */
  Id: number
  /** 訂單號 */
  OrderId: string
  /** 備註 */
  Remark: string
  /** 審核備註 */
  ReviewNote: string
  /** 帳變類型 */
  TransferType: number
  /** 更新時間 */
  UpdateTime: number
  /** 錢包類型 */
  WalletType: number
}

export interface FinancecenterDetaillistRequest extends RequestPage {
  /** 帳變類型 (0 = 全部 1 = 代理轉賬 2 = 代理代存-代存 3 = 額度調整 4 = 代理紅利 6 = 傭金提現 7 = 傭金髮放 8 = 額度還款 9 = 傭金還款 10 = 代理代存-紅利 11 = 代理充值 12 = 傭金調整 14 = 傭金轉額度 15 = 傭金結算 16 = 傭金提現返還) */
  TransferType: number
  /** 錢包類型, 多個以逗號分隔 (1: 佣金錢包 2: 額度錢包) */
  WalletType: string
  /** 起始時間 */
  BeginTime: number
  /** 結束時間 */
  EndTime: number
  /** 排序欄位(帳變時間:CreateTime 帳變金額:AdjustAmount)，正負號為升降冪 */
  Sort: string
}

export interface FinancecenterDetaillistResponseData {
  Items: Array<FinancecenterDetaillist>
  MoreItems: {
    /** 佣金帳變總金額 */
    CommissionChangeGold: number
    /** 總數 */
    Count: number
    /** 額度帳變總金額 */
    QuotaChangeGold: number
  }
  Pagination: Pagination
}

export type FinancecenterDetaillistResponse = BaseResponse<FinancecenterDetaillistResponseData>
