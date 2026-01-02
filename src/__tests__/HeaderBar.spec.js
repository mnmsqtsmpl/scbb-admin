import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import HeaderBar from '../components/HeaderBar.vue'

describe('HeaderBar', () => {
  it('renders title', () => {
    const wrapper = mount(HeaderBar, {
      global: {
        stubs: ['router-link'],
      },
    })
    expect(wrapper.text()).toContain('SCBB Admin')
  })
})