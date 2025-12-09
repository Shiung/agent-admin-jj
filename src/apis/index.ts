// export * from './modules/test'

import { apiClient } from './api-client'
import { System } from './codegen/System'
import { Admin } from './codegen/Admin'
import { Game } from './codegen/Game'
import { Netcashmulti } from './codegen/Netcashmulti'
import { Netcashteam } from './codegen/Netcashteam'
import { PlayerManage } from './codegen/Playermanage/index'
import { NetCashPlayerGame } from './codegen/NetCashPlayerGame/index'
import { ApiConfig } from './codegen/ApiConfig/index'
import { Report } from './codegen/Report'
import { Config } from './codegen/Config'
import { Finance } from './codegen/Finance'

export default {
  system: new System(apiClient),
  admin: new Admin(apiClient),
  game: new Game(apiClient),
  netcashmulti: new Netcashmulti(apiClient),
  netcashteam: new Netcashteam(apiClient),
  playerManage: new PlayerManage(apiClient),
  netCashPlayerGame: new NetCashPlayerGame(apiClient),
  apiConfig: new ApiConfig(apiClient),
  report: new Report(apiClient),
  config: new Config(apiClient),
  finance: new Finance(apiClient),
}
