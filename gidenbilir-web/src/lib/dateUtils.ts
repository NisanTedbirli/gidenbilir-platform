/**
 * Tarih utilities — mobile/perspektif/src/utils/dateUtils.ts'tan port edildi.
 * Web'de aynı dayjs setup, sadece import path değişir.
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/tr'

dayjs.extend(relativeTime)
dayjs.locale('tr')

export const timeAgo = (date: string | Date): string => dayjs(date).fromNow()

export const formatDate = (date: string | Date): string => dayjs(date).format('D MMMM YYYY')

export const formatShortDate = (date: string | Date): string => dayjs(date).format('MMM YYYY')
