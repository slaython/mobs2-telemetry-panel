import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VehicleList from '../src/components/VehicleList.vue'

describe('VehicleList', () => {
  it('renderiza placa, combustível e botão', () => {
    const wrapper = mount(VehicleList, {
      props: {
        activePlate: null,
        vehicles: [
          {
            plate: 'ABC-1234',
            speed: 28,
            fuel: 42,
            timestamp: '2025-10-26T12:00:00Z',
          },
        ],
      },
    })

    expect(wrapper.text()).toContain('ABC-1234')
    expect(wrapper.text()).toContain('28 km/h')
    expect(wrapper.text()).toContain('42% combustível')
    expect(wrapper.text()).toContain('Abastecer')
  })

  it('emite "select" quando clico na linha', async () => {
    const wrapper = mount(VehicleList, {
      props: {
        activePlate: null,
        vehicles: [
          {
            plate: 'ABC-1234',
            speed: 28,
            fuel: 42,
            timestamp: '2025-10-26T12:00:00Z',
          },
        ],
      },
    })

    // a div que tem @click="$emit('select', v.plate)"
    const rowMain = wrapper.find('.row-main')
    await rowMain.trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual(['ABC-1234'])
  })

  it('emite "refuel" quando clico no botão', async () => {
    const wrapper = mount(VehicleList, {
      props: {
        activePlate: null,
        vehicles: [
          {
            plate: 'ABC-1234',
            speed: 28,
            fuel: 42,
            timestamp: '2025-10-26T12:00:00Z',
          },
        ],
      },
    })

    const btn = wrapper.find('button.refuel-btn')
    await btn.trigger('click')

    expect(wrapper.emitted('refuel')).toBeTruthy()
    expect(wrapper.emitted('refuel')?.[0]).toEqual(['ABC-1234'])
  })
})
