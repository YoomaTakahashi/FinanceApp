import Toast, { type PluginOptions, POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  const options: PluginOptions = {
    position:             POSITION.TOP_RIGHT,
    timeout:              3500,
    closeOnClick:         true,
    pauseOnFocusLoss:     true,
    pauseOnHover:         true,
    draggable:            true,
    draggablePercent:     0.6,
    showCloseButtonOnHover: false,
    hideProgressBar:      false,
    closeButton:          'button',
    icon:                 true,
    rtl:                  false,
    toastClassName:       'finance-toast',
    containerClassName:   'finance-toast-container',
  }

  nuxtApp.vueApp.use(Toast, options)
})
