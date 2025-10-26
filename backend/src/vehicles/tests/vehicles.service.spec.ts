import { VehiclesService } from '../vehicles.service'
describe('VehiclesService', () => {
  it('jitter varia dentro do delta', () => {
    const svc = new VehiclesService({} as any, {} as any, { emitTelemetry: () => {} } as any)
    const base = -8, j = (svc as any).jitter(base, 0.001)
    expect(Math.abs(j - base)).toBeLessThanOrEqual(0.001)
  })
})
