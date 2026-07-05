import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,

    theme: {
      defaultTheme: 'light',
      themes: {
        dark: {
          dark: true,
          colors: {
            background:   '#061325',
            surface:      '#0A1F3C',
            primary:      '#64B5F6',
            secondary:    '#0E2A4E',
            accent:       '#FFFFFF',
            error:        '#CF6679',
            warning:      '#FFB547',
            info:         '#4FC3F7',
            success:      '#66BB6A',
            'on-primary': '#061325',
          },
        },
        light: {
          dark: false,
          colors: {
            background:   '#F6F6F6',
            surface:      '#FFFFFF',
            primary:      '#052962',
            secondary:    '#E3ECF6',
            accent:       '#0084C6',
            error:        '#C70000',
            warning:      '#E65100',
            info:         '#0084C6',
            success:      '#2E7D32',
            'on-primary': '#FFFFFF',
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
