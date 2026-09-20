import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AnalyticsProvider>
      <Component {...pageProps} />
    </AnalyticsProvider>
  )
}
