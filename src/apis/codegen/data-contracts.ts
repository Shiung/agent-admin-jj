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
