import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
// import 'tw-elements';
import '../styles/globals.css'
import 'antd/dist/antd.css';
import '../styles/index.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session} >
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
