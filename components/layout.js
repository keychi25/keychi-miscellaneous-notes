import Head from 'next/head'
import styles from './layout.module.css'
import Link from 'next/link'
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  MenuList,
  MenuItem,
  ListItemIcon,
  BottomNavigation,
  BottomNavigationAction,
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import GitHubIcon from '@material-ui/icons/GitHub'
import TwitterIcon from '@material-ui/icons/Twitter'

export const siteTitle = 'Keychiの雑記'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    textAlign: 'center',
  },
  footerTitle: {
    flexGrow: 1,
    textAlign: 'reft',
    marginLeft: theme.spacing(2),
  },
  stickToBottom: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
  },
}))

export default function Layout({ children, home }) {
  const classes = useStyles()
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  })

  const toggleDrawer = (side, open) => () => {
    setState({
      [side]: open,
    })
  }
  const sideList = (
    <div>
      <MenuList>
        <MenuItem>
          <ListItemIcon>
            <GitHubIcon fontSize="small" />
          </ListItemIcon>
          <a
            href="https://github.com/keychi25"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Typography variant="inherit">GitHub</Typography>
          </a>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <a
            href="https://twitter.com/f_keychi_ktk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Typography variant="inherit">Twitter</Typography>
          </a>
        </MenuItem>
      </MenuList>
    </div>
  )
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta
          property="og:image"
          content={`https://og-image.now.sh/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            {siteTitle}
          </Typography>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer('left', true)}
          >
            <MenuIcon />
          </IconButton>
          <Drawer open={state.left} onClose={toggleDrawer('left', false)}>
            <div
              tabIndex={0}
              role="button"
              onClick={toggleDrawer('left', false)}
              onKeyDown={toggleDrawer('left', false)}
            >
              {sideList}
            </div>
          </Drawer>
        </Toolbar>
      </AppBar>
      <div>
        <main>{children}</main>
        {!home && (
          <div className={styles.container}>
            <div className={styles.backToHome}>
              <Link href="/">
                <a>← Back to home</a>
              </Link>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation className={classes.stickToBottom} s>
        <Typography className={classes.footerTitle}>
          &copy;{siteTitle}
        </Typography>
      </BottomNavigation>
    </>
  )
}
