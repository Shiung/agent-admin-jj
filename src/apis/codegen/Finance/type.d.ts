export interface CommissionOverviewResponse {
  Code: number
  Data: CommissionOverviewData
  Msg: string
  Id: string
}

export interface CommissionOverviewData {
  /** 可用佣金餘額 = 代理錢包餘額 */
  Available: number
  /** 不可用余额 = 待发放 + 已发放提现中 */
  NotAvailable: number
}

export interface WithdrawAllowedListResponse {
  Code: number
  Data: WithdrawAllowedListData
  Msg: string
  Id: string
}

export interface WithdrawAllowedListData {
  Items: {
    /** 提現名稱 */
    Name: string
    /** PayType */
    PayType: number
    /** 幣種名稱 */
    CurrencyName: string
    /** 是否為虛擬幣 */
    IsCrypto: boolean
    /** 是否允許輸入金額 1:允許 0:不允許 */
    AllowInput: number
    /** 最小提現金額 */
    MinAmount: number
    /** 最大提現金額 */
    MaxAmount: number
    /** 快選金額 */
    GoldList: string
    /** 手續費%數 */
    ServiceRate: number
    /** 排序 */
    Sort: number
    [key: string]: any
  }[]
  currencyNameMap: Record<string, {
    [key: string]: any
  }[]>
}

export interface BankCardAccountListQuery {
  Type: number | string
}

export interface BankCardAccountListResponse {
  Code: number
  Data: BankCardAccountListData
  Msg: string
  Id: string
}

export interface BankCardAccountListData {
  Items: BankCardAccountListDataItem[]
}

export interface BankCardAccountListDataItem {
  Id: number
  /** 銀行帳號 / 支付寶賬號 */
  BankCardNum: string
  /** 持卡人 / 帳戶名稱 */
  RealName: string
  [key: string]: any
}

export interface AddBankCardAccountFormData {
  /** 普通銀行卡1001時傳0, 其餘傳1 */
  Type: number
  /** 銀行/支付寶賬號 */
  BankCardNum: string
  /** 持卡人 */
  RealName: string
  /** 銀行代碼(銀行卡才有) */
  BankCode?: string
  /** 銀行名稱(銀行卡才有) */
  Name?: string
  /** 驗證方式 */
  ValidType: number
  /** 驗證碼 */
  Code: string
}

export interface AddBankCardAccountResponse {
  Code: number
  Data: string
  Msg: string
  Id: string
}

export interface DeleteBankCardAccountResponse {
  Code: number
  Data: string
  Msg: string
  Id: string
}

export interface CryptoAccountListQuery {
  DigitalType: number | string
}

export interface CryptoAccountListResponse {
  Code: number
  Data: CryptoAccountListData
  Msg: string
  Id: string
}

export interface CryptoAccountListData {
  Items: CryptoAccountListDataItem[]
}

export interface CryptoAccountListDataItem {
  Id: number
  /** 別名 */
  DigitalAlias: string
  /** 協議 */
  DigitalDesc: string
  /** 地址 */
  DigitalAddress: string

  [key: string]: any
}

export interface AddCryptoAccountFormData {
  /** 別名 */
  DigitalAlias: string
  /** 虛擬幣地址 */
  DigitalAddress: string
  /** 虛擬幣協議 */
  CryptoCurrencyConfigId: number
  /** 驗證方式 */
  ValidType: number
  /** 驗證碼 */
  Code: string
}
export interface AddCryptoAccountResponse {
  Code: number
  Data: string
  Msg: string
  Id: string
}

export interface DeleteCryptoAccountResponse {
  Code: number
  Data: string
  Msg: string
  Id: string
}

export interface AppliedAmountQuery {
  /** PayType */
  AccountType: number
}

export interface AppliedAmountResponse {
  Code: number
  Data: {
    /** 當日已提現金額 */
    AppliedAmount: number
  }
  Msg: string
  Id: string
}

export interface WithdrawUSDTRateQuery {
  /** PayType */
  AccountType: number
}

export interface WithdrawUSDTRateResponse {
  Code: number
  Data: {
    /** USDT匯率 */
    CryptoRate: number
  }
  Msg: string
  Id: string
}

// TODO 不確定
export interface DDBWalletConfigQuery {
  /** 好像固定傳 0 */
  Amount: number
  /** 真實姓名 */
  RealName: string
}

// TODO 不確定
export interface DDBWalletConfigResponse {
  Code: number
  Data: {
    Url: string
  }
  Msg: string
  Id: string
}

// TODO 不確定
export interface DDBBalanceQuery {
  /** 真實姓名 */
  RealName: string
}

// TODO 不確定
export interface DDBBalanceResponse {
  Code: number
  Data: {
    Balance: number
  }
  Msg: string
  Id: string
}

// TODO 不確定
export interface DDBAddressResponse {
  Code: number
  Data: {
    Changed: boolean
  }
  Msg: string
  Id: string
}

export interface WithdrawMoneyFormData {
  /** PayType */
  AccountType: number
  /** 虛擬幣帳號/銀行卡ID */
  BankCardId: number
  /** 同BankCardId */
  DigitalAddressId: number
  /** 虛擬幣地址 */
  DigitalAddress?: string
  /** 虛擬幣協議 */
  DigitalDesc?: string
  /** 提現金額 */
  Amount: number
  /** 私人密碼 */
  PayPassword: string
}

export interface WithdrawMoneyResponse {
  Code: number
  Data: string
  Msg: string
  Id: string
}

export interface WithdrawRecordConfigResponse {
  Code: number
  Data: {
    Id: number
    /** 雲平台的設置是否打開 1:開, 2:關 */
    IsOpen: number
    /** 可查詢天數上限 */
    LimitDay: number
  }[]
  Msg: string
  Id: string
}

export interface WithdrawRecordListQuery {
  /** 開始時間 */
  BeginTime: number
  /** 結束時間 */
  EndTime: number
  /** 提現方式 */
  AccountType?: string | number
  /** 訂單狀態 0:全部, 1:申請中, 2:已打款, 3:已拒絕, 4:已打款, 5:審核中, */
  Status?: number
  /** 排序 */
  Sort?: string
  Page: number
  PageSize: number
}

export interface WithdrawRecordListResponse {
  Code: number
  Data: {
    Items: Record<string, any>[]
    Pagination: Pagination
    Total: Record<string, any>
  }
  Msg: string
  Id: string
}

export interface Pagination {
  /** 當前頁數 */
  CurrPage: 1,
  /** 總筆數 */
  MaxCount: 3,
  /** 總頁數 */
  MaxPageCount: 1,
  /** 每頁筆數 */
  PageSize: 10
}

export interface AccountBalanceResponse {
  Code: number
  Data: AccountBalanceData
  Msg: string
  Id: string
} 

export interface AccountBalanceData {
  IsActiveLimit3: number
  IsActiveTransfer: number
  IsPassword: number
  IsShowMultiple: number
  Items: Record<string, any>
  Items2: Record<string, any>
  Items3: Record<string, any>
}

export interface RechargeAllowedListResponse {
  Code: number
  Data: RechargeAllowedListData
  Msg: string
  Id: string
}

export interface RechargeAllowedListData {
  Info: {
    /** 充值名稱 */
    Name: string
    /** PayType */
    PayType: number
    /** 充值通道 */
    expandables: RechargeChannel[]
    /** type有值("expandable"), 代表有多個通道(不確定) */
    type: string
    [key: string]: any
  }[]
}

export interface RechargeChannel {
  Id: number
  /** 是否允許輸入金額 1:允許 2:不允許 */
  AllowInput: number
  /** 最小充值金額 */
  InputMin: number
  /** 最大充值金額 */
  InputMax: number
  /** 快選金額 */
  Gears: string
  /** 通道名稱 */
  ShowName: string
  [key: string]: any
}

export interface RechargeMoneyFormData {
  /**  最上級代理ID */
  AgentId: number
  /**  使用者ID */
  PlayerId: number
  /**  使用者名稱 */
  PlayerUserName: string
  /**  使用者名稱 */
  PlayerName: string
  /**  最上級代理ID (同AgentId) */
  PayAdminId: number
  /**  PayType */
  PayType: number
  /**  金額(元) */
  Amount: number
  /**  金額(元) (同Amount) */
  RealAmount: number
  /** 直接傳f */
  Process: string
  /** 通道ID */
  RechargeId: number
  /** 真實姓名 (DD錢包用) */
  AccountName?: string
}

export interface RechargeMoneyResponse {
  Code: number
  Data: RechargeMoneyData
  Msg: string
  Id: string
}

export interface RechargeMoneyData {
  amount: number
  orderId: string
  ownWebBrowser?: boolean
  payUrl: string | RechargeMoneyPayUrlData | Record<string, any>
  sign?: string
  status?: number
  t?: number
  [key: string]: any
} 

export interface RechargeMoneyPayUrlData {
  /** 三方頁面連結 */
  data?: string
  card2CardReceiveInfo?: string | Record<string, any>
  /** 到期時間 */
  ExpireTime?: number
  [key: string]: any
}

export interface RechargeMoneyCancelFormData {
  /**  使用者ID */
  PlayerId: number
  /**  使用者名稱 */
  PlayerName: string
  /**  訂單號 */
  OrderId: string
}

export interface RechargeMoneyCancelResponse {
  Code: number
  Data: string
  Msg: string
  Id: string
}

export interface RechargeRecordListQuery {
  /** 開始時間 */
  BeginTime?: number
  /** 結束時間 */
  EndTime?: number
  /** 訂單狀態 ''全部狀態, 1處理中, 2充值完成, 3充值失敗, 4已審核, 12充值取消, 13用戶取消 */
  Status?: string | number
  /** 排序 */
  Sort?: string
  Page?: number
  PageSize?: number
}

export interface RechargeRecordListResponse {
  Code: number
  Data: RechargeRecordListData
  Msg: string
  Id: string
}

export interface RechargeRecordListData {
  Items: null | RechargeRecordListDataItem[]
  Pagination: Pagination
  Total: Record<string, any>
}

export interface RechargeRecordListDataItem {
  Amount: number
  OrderId: string
  [key: string]: any
}

export interface RechargeUSDTRateFormData {
  /** PayType */
  PayType: number
}

export interface RechargeUSDTRateResponse {
  Code: number
  Data: {
    /** USDT匯率 */
    CryptoRate: number
  }
  Msg: string
  Id: string
}