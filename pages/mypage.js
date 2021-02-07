import Head from 'next/head'

import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'

export default function Mypage() {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd} />
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`} />
    </Layout>
  )
}
