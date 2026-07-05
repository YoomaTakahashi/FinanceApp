import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(relativeTime)
dayjs.extend(weekOfYear)
dayjs.extend(localizedFormat)

export default defineNuxtPlugin(() => {
  return { provide: { dayjs } }
})
