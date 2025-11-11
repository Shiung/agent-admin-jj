export interface LoginFormData {
  Username: string
  Password: string
  ValidCode: string
  KeyCode: string
  FromType: number
  Domain: string
  IsApp: number
  UseNewPermission: boolean
  Platform: string
  DeviceId: string
}

export interface LoginResponseData {
  LoginType: number
}

export interface LoginResponse {
  Code: number
  Data: LoginResponseData | UserInfo | null
  Msg: string
  Id: string
}

export interface ImageValidCodeResponse {
  Code: number
  Data: {
    Item: string
    KeyCode: string
  }
  Msg: string
  Id: string
}

export interface VLoginFormData {
  Username: string
  Password: string
  ValidCode: string
}

export interface VLoginResponse {
  Code: number
  Data: UserInfo | null
  Msg: string
  Id: string
}

export interface UserInfo {
  Account: Record<string, any>
  Admin: Record<string, any>
  IsRequireGoogleAuthBinding: number
  NavV2: Record<string, any> | null
  NetCashAccount: Record<string, any>
  RoleV2: Record<string, any> | null
  SubMenusV2: Record<string, any>
  Token: string
}

export interface IsLoginResponse {
  Code: number
  Data: UserInfo | null
  Msg: string
  Id: string
}

export interface CompareCommissionResponse {
  Code: number
  Data: CompareCommissionResponseData
  Msg: string
  Id: string
}

export interface CompareCommissionResponseData {
  CurrentMonth: CompareCommissionData
  LastMonth: CompareCommissionData
}

export interface CompareCommissionData {  
  ReportMonth: string // 佣金月份
  CommissionTotal: number // 预计佣金 
  CommissionRate: number // 佣金比例
  BetWinTotal: number // 公司输赢，單位:分
  MoneyChangeFee: number // 輸贏調整承擔費用，單位:分
  ApiFeeTotalFee: number // 平台費承擔費用，單位:分
  PayMoneyFee: number // 存款承擔費用，單位:分
  WithdrawMoneyFee: number // 提款承擔費用，單位:分
  BackWaterGoldFee: number // 返水承擔費用，單位:分
  RedGoldFee: number // 紅利承擔費用，單位:分
  LastMonthCleanBetWinTotal: number // 上期结余，單位:分
  AdminChargeMoneyFee: number // 代存回馈，單位:分
  CommissionChildTotal: number // 下級貢獻，單位:分
  CommissionChildList: CommissionChildList[] // 各層下級貢獻
  CleanBetWinTotal: number // 净输赢，單位:分
}

export interface CommissionChildList {
  Level: number // 代理层级
  CurrentAdmin: boolean // 是否为登入者层级
  CommissionTotal: number // 佣金总计，单位:分
}

/** `0` 代理域名 `1` 專屬域名 */
export type DomainType = 0 | 1

interface Domain {
  /** 域名類型 */
  NetCashDomainType: DomainType
  /** 域名 */
  Domain: string
}

export interface PromotionlinkListV2Request {
  NetCashDomainType: DomainType
}

export interface PromotionlinkListV2ResponseData {
  /** 管理員 ID */
  AdminId: number
  /** 代理 ID */
  AgentId: number
  /** 渠道 ID */
  ChannelId: string
  /** 克隆渠道 ID */
  CloneChannelId: string
  /** 產品 ID */
  PackageId: number
  /** 產品名稱 */
  PackageName: string
  /** 邀請碼 */
  InvitationCode: string
  /** 建渠道的安卓母包版本 */
  AndroidPackVersion: string
  /** 建渠道的IOS母包版本 */
  IosPackVersion: string
  /** 推廣類型
   * `0` 游戏-首页
   * `1` 游戏-直播页
   * `2` 纯直播
   * `3` 首页（无直播）
   * `4` 纯直播（登录后游戏-直播页）
   * `5` 游戏-杯赛页
   */
  PushType: 0 | 1 | 2 | 3 | 4 | 5
  /** 產品圖標 */
  Icon: string
  /** APP 域名連結 */
  AppDomains: Array<Domain>
  /** PC/H5 域名連結 */
  H5Domains: Array<Domain>
  /** 創建時間 */
  CreateTime: number
}

export interface PromotionlinkListV2Response {
  Code: number
  Data: { Items: Array<PromotionlinkListV2ResponseData> }
  Msg: string
  Id: string
}

export interface PromotionconfListallResponseData {
  /** 素材 ID */
  Id: number
  /** 代理 ID */
  AdminId: number
  /** 元素類型 */
  Type: PromotionconfListallRequest['Type']
  /** 內容 */
  Value: string
  /** 是否刪除 */
  Deleted: number
  /** 建立素材的管理員 ID */
  CreateAdminId: number
  /** 創建時間 */
  CreateTime: number
  /** 更新時間 */
  UpdateTime: number
}

export interface PromotionconfListallRequest {
  /** 元素類型 
   * `1` 尺寸
   * `2` 主題
  */
  Type: 1 | 2
}

export interface PromotionconfListallResponse {
  Code: number
  Data: { Items: Array<PromotionconfListallResponseData> }
  Msg: string
  Id: string
}

export interface PromotionmaterialsListallResponseData {
  /** 素材 ID */
  Id: number
  /** 素材圖片路徑 */
  ImagePath: string
  /** 代理語言分組 ID */
  LangGroupId: number
  /** 產品 ID */
  PackageId: number
  /** 產品名稱 */
  PackageName: string
  /** 尺寸 ID */
  SizeId: number
  /** 尺寸名稱 */
  SizeName: string
  /** 主題 ID */
  ThemeId: number
  /** 主題名稱 */
  ThemeName: string
  /** 創建時間 */
  CreateTime: number
}
export interface PromotionmaterialsListallRequest {
  /** 尺寸 ID */
  SizeId?: number
  /** 主題 ID */
  ThemeId?: number
  /** 產品 ID */
  PackageId?: number
}

export interface PromotionmaterialsListallResponse {
  Code: number
  Data: { Items: Array<PromotionmaterialsListallResponseData> }
  Msg: string
  Id: string
}
