import React, { useEffect } from 'react'
import Head from 'next/head'
import marked from 'marked'
import hljs from 'highlight.js/lib/core'

import { getAllPostIds, getPostData } from '../../lib/posts'
import Date from '../../components/date'

import Layout from '../../components/layout'
import utilStyles from '../../styles/utils.module.css'
import styles from '../../components/layout.module.css'

export default function Post({ postData }) {
  useEffect(() => {
    hljs.initHighlighting()
  })
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <div className={styles.container}>
        <article>
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <div className={utilStyles.lightText}>
            <Date dateString={postData.date} />
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: marked(postData.contentHtml) }}
          />
        </article>
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id)
  return {
    props: {
      postData,
    },
  }
}
