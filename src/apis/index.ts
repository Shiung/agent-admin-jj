// export * from './modules/test'

import { apiClient } from './api-client'
import { System } from './codegen/System'
import { Admin } from './codegen/Admin'
import { Game } from './codegen/Game'
import { Report } from './codegen/Report'
import { Config } from './codegen/Config'
import { Finance } from './codegen/Finance'

export default {
  system: new System(apiClient),
  admin: new Admin(apiClient),
  game: new Game(apiClient),
  report: new Report(apiClient),
  config: new Config(apiClient),
  finance: new Finance(apiClient),
}
