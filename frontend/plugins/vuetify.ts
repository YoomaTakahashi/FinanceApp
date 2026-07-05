import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,

    theme: {
      defaultTheme: 'dark',
      themes: {
        dark: {
          dark: true,
          colors: {
            background:   '#080808',
            surface:      '#111111',
            primary:      '#C9A84C',
            secondary:    '#1A1A1A',
            accent:       '#FFFFFF',
            error:        '#CF6679',
            warning:      '#FFB547',
            info:         '#4FC3F7',
            success:      '#66BB6A',
            'on-primary': '#000000',
          },
        },
        light: {
          dark: false,
          colors: {
            background: '#F5F5F5',
            surface:    '#FFFFFF',
            primary:    '#B8942A',
            secondary:  '#E0E0E0',
            accent:     '#212121',
            error:      '#B00020',
            warning:    '#E65100',
            info:       '#0277BD',
            success:    '#2E7D32',
          },
        },
      },
    },

    defaults: {
      VBtn:      { rounded: 'lg', elevation: 0 },
      VCard:     { rounded: 'xl', elevation: 0 },
      VTextField:{ rounded: 'lg', variant: 'outlined', density: 'comfortable' },
      VSelect:   { rounded: 'lg', variant: 'outlined', density: 'comfortable' },
      VTextarea: { rounded: 'lg', variant: 'outlined', density: 'comfortable' },
      VChip:     { rounded: 'lg' },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
