import Head from 'next/head'

import { getSortedPostsData } from '../lib/posts'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'

import Link from 'next/link'
import Date from '../components/date'
import Tags from '../components/tags'
import SingleLineGridList from '../components/gridList'

import { makeStyles } from '@material-ui/core/styles'
import {
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Grid,
  Container,
} from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    marginBottom: 12,
    fontSize: 25,
  },
  card: {
    marginTop: theme.spacing(2),
  },
}))

export default function Home({ allPostsData }) {
  const classes = useStyles()
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <img src="/images/header.jpg" className={utilStyles.headerImg} key="1" />
      <section>
        <Grid container>
          <Grid item xs={12} sm={8} zeroMinWidth>
            <Container fixed>
              <h2 className={utilStyles.headingLg}>Posts</h2>
              {allPostsData.map(({ id, date, title, tags }) => (
                <Card className={classes.card} key={id}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary">
                      {title}
                    </Typography>
                    <Typography variant="body2" component="p">
                      <Date dateString={date} />
                    </Typography>
                    <Typography variant="body2">
                      <Tags tags={tags} />
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Link href="/posts/[id]" as={`/posts/${id}`}>
                      <Button size="small">Read More</Button>
                    </Link>
                  </CardActions>
                </Card>
              ))}
            </Container>
          </Grid>
          <Grid item xs={12} sm={4} zeroMinWidth>
            <Container fixed>
              <h2 className={utilStyles.headingLg}>作ったやつ</h2>
              <Card className={classes.card}>
                <CardContent>
                  <Typography className={classes.title} color="textSecondary">
                    title
                  </Typography>
                </CardContent>
              </Card>
            </Container>
          </Grid>
        </Grid>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData,
    },
  }
}
