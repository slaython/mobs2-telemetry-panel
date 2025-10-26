import { describe, it, expect } from 'vitest'
describe('URL de busca', () => {
  it('monta query plate corretamente', () => {
    const url = new URL('/vehicles', 'http://x')
    url.searchParams.set('plate','ABC')
    expect(url.toString()).toContain('plate=ABC')
  })
})
