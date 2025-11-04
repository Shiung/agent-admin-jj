// export * from './modules/test'

import { apiClient } from './api-client'
import { System } from './codegen/System'

export default {
  system: new System(apiClient),
}
