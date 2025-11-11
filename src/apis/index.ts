// export * from './modules/test'

import { apiClient } from './api-client'
import { System } from './codegen/System'
import { Admin } from './codegen/Admin'
import { Game } from './codegen/Game'

export default {
  system: new System(apiClient),
  admin: new Admin(apiClient),
  game: new Game(apiClient),
}
