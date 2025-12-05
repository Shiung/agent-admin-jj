export interface Pagination {
  /** 當前頁數 */
  CurrPage: number
  /** 總筆數 */
  MaxCount: number
  /** 總頁數 */
  MaxPageCount: number
  /** 分頁筆數 */
  PageSize: number
}

export interface BaseResponse<T = unknown> {
  Code: number
  Data: T
  Msg: string
  id: string
}

export interface RequestPage {
  /** 頁碼 */
  Page?: number
  /** 每頁數量 */
  PageSize?: number
}