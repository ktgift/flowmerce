export class Database {
  exec(_sql: string) { return this }
  run(_sql: string, ..._params: any[]) { return { changes: 0, lastInsertRowid: 0 } }
  prepare(_sql: string) {
    return {
      run: (..._params: any[]) => ({ changes: 0, lastInsertRowid: 0 }),
      get: (..._params: any[]) => undefined,
      all: (..._params: any[]) => [],
      finalize: () => {},
    }
  }
  close() {}
}
