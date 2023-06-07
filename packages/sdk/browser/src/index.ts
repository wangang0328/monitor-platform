import { BaseClient } from '@wa-dev/monitor-sdk-core'

class BrowserClient extends BaseClient {
  constructor(config: any) {
    super(config)
  }

  report() {
    // do something
  }
}

export default BrowserClient
