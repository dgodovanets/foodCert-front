import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { Button } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { MainListItems, SecondaryListItems } from './listItems';
import Transportations from './Transportations';
import Users from './Users';
import { useCookies } from 'react-cookie';
import locale_uk from 'dayjs/locale/uk';
import {
  Switch,
  Route,
  useLocation,
  Redirect
} from "react-router-dom";
import cfg from '../config/config';
import dayjs from 'dayjs';
import Backup from './Backup';


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="/">
        Food Cert
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  transportationsWrapper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  userFullName: {
    paddingRight: theme.spacing(2)
  },
  uaButton: {
    marginRight: theme.spacing(3)
  }
}));

export default function Dashboard() {
  const classes = useStyles();

  // Hook for rerendering when tab changed.
  const location = useLocation();

  const [open, setOpen] = React.useState(true);
  const [cookies, setCookie, removeCookie] = useCookies();
  const langPack = cfg[cookies.lang ? cookies.lang : 'en'];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const logOut = () => {
    removeCookie('auth_token');
    removeCookie('user');
  }

  const handleEn = () => {
    dayjs.locale('en');
    setCookie('lang', 'en');
  }

  const handleUa = () => {
    dayjs.locale(locale_uk);
    setCookie('lang', 'ua');
  }

  if (!cookies.auth_token) {
    return <Redirect to="/signIn" />
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            {langPack.Dashboard}
          </Typography>
          <Button color="inherit" size="large" onClick={handleEn} disabled={cookies.lang === 'en' || !cookies.lang}>
            EN
          </Button>
          <Button color="inherit" size="large" onClick={handleUa} className={classes.uaButton} disabled={cookies.lang === 'ua'}>
            UA
          </Button>
          <Typography noWrap color="inherit" className={classes.userFullName}>
            {cookies.user && cookies.user.firstName + " " + cookies.user.lastName}
          </Typography>
          <Button color="inherit" onClick={logOut} variant="outlined" >
            {langPack.logout}
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List><MainListItems/></List>
        {cookies.user.isAdmin && 
          <>
            <Divider />
            <List><SecondaryListItems/></List>
          </>
        }
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            {/* Recent Orders */}
            <Grid item xs={12}>
              <Grid item className={classes.transportationsWrapper}>
                <Switch>
                  <Route exact path="/dashboard">
                    <Transportations authToken={cookies.auth_token} key={'myTransportations'}/>
                  </Route>
                  <Route path="/dashboard/admin/all">
                    <Transportations authToken={cookies.auth_token} allMode key={'allTransportations'}/>
                  </Route>
                  <Route path="/dashboard/admin/users">
                    <Users authToken={cookies.auth_token} key={'userssssall'}/>
                  </Route>
                  <Route path="/dashboard/admin/backup">
                    <Backup authToken={cookies.auth_token} key={'adminbackup'}/>
                  </Route>
                </Switch>
              </Grid>
            </Grid>
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>
      </main>
    </div>
  );
}