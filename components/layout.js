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
} from '@material-ui/core'

import MenuIcon from '@material-ui/icons/Menu'
import GitHubIcon from '@material-ui/icons/GitHub'
import TwitterIcon from '@material-ui/icons/Twitter'
import BorderColorIcon from '@material-ui/icons/BorderColor'

export const siteTitle = 'Keychi-Notes'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  wrraper: {
    minHeight: '100vh',
    paddingBottom: '60px',
    position: 'relative',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  thisTitle: {
    flexGrow: 1,
    textAlign: 'center',
  },
  footerTitle: {
    flexGrow: 1,
    textAlign: 'left',
    marginLeft: theme.spacing(2),
  },
  stickToBottom: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  drawerPaper: {
    width: '200px',
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
        <MenuItem>
          <ListItemIcon>
            <BorderColorIcon fontSize="small" />
          </ListItemIcon>
          <a
            href="https://mystudy-client.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Typography variant="inherit">My Study</Typography>
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
      <div className={classes.wrraper}>
        <AppBar position="static" color="inherit">
          <Toolbar>
            <Typography className={classes.thisTitle}>{siteTitle}</Typography>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer('left', true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              open={state.left}
              onClose={toggleDrawer('left', false)}
              classes={{
                paper: classes.drawerPaper,
              }}
            >
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
        <BottomNavigation className={classes.stickToBottom}>
          <Typography className={classes.footerTitle}>
            &copy; {new Date().getFullYear()} {siteTitle}
          </Typography>
        </BottomNavigation>
      </div>
    </>
  )
}
