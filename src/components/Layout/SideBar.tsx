import cookie from 'js-cookie';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Hidden,
} from '@mui/material';
import { useTheme, Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

import ExpandLessIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import DotIcon from '@mui/icons-material/FiberManualRecordRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import sidebarItems, { Menu, SubMenu } from './sidebarItems';
import useWindowSize from '../../util/WindowSize';
import { GetDataFromJwtToken } from '../../util/functions';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    width: 240,
    height: 'calc(100% - 55px)',
    top: 55,
    position: 'fixed',
    overflowY: 'hidden',
    borderRight: 'none',
    backgroundColor: '#343a40',
  },
  drawerMobile: {
    width: 240,
    height: '100%',
    top: 0,
    position: 'fixed',
    overflowY: 'hidden',
    borderRight: 'none',
    backgroundColor: '#343a40',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 55,
    top: 0,
    position: 'absolute',
  },
  drawerContent: {
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(255,255,255,.1)',
    },
  },
  drawerContentMobile: {
    marginTop: 55,
    width: '100%',
    height: 'calc(100% - 55px)',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(255,255,255,.1)',
    },
  },
  menuIcon: {
    minWidth: 40,
    cursor: 'pointer',
    color: theme.palette.background.paper,
    paddingLeft: theme.spacing(2),
  },
  logo: {
    color: 'white',
    height: 16,
    marginLeft: theme.spacing(2),
  },
  listItem: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  itemSelectedBox: {
    cursor: 'pointer',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    margin: 3,
    borderRadius: 6,
    backgroundColor: theme.palette.primary.main,
  },
  subSelectedBox: {
    cursor: 'pointer',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    margin: 3,
    borderRadius: 6,
    backgroundColor: theme.palette.background.paper,
  },
  unselectedBox: {
    margin: 3,
    cursor: 'pointer',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  listItemIcon: {
    minWidth: 40,
    color: theme.palette.background.paper,
  },
  listItemText: {
    color: theme.palette.background.paper,
    userSelect: 'none',
  },
  listItemTextSelected: {
    color: '#343a40',
    userSelect: 'none',
  },
  collapsedIcon: {
    width: 20,
    height: 20,
    color: theme.palette.background.paper,
  },
  iconSubItem: {
    width: 15,
    height: 15,
    marginLeft: theme.spacing(0.5),
    color: theme.palette.background.paper,
  },
  iconSubItemSelected: {
    width: 15,
    height: 15,
    marginLeft: theme.spacing(0.5),
    color: '#343a40',
  },
}));

type Props = {
  isDrawerOpen: boolean,
  setDrawerOpen: () => void,
}

const Sidebar = (props: Props) => {
  const classes = useStyles();
  const router = useRouter();
  const theme = useTheme();
  const size = useWindowSize();

  const { isDrawerOpen, setDrawerOpen } = props;

  const token = cookie.get('token') || null;

  const isClientLogged = Boolean(GetDataFromJwtToken(token)?.pessoaId);

  const userLogged = !isClientLogged;
  const clientLogged = isClientLogged;
  const userAdmin = userLogged && Boolean(GetDataFromJwtToken(token)?.usuarioAdm);

  const [opennedItem, setOpennedItem] = useState(false);
  const [descOpennedItem, setDescOpennedItem] = useState('');
  const [selectedItem, setSelectedItem] = useState('home');

  const isCurrentPath = (path) => {
    return `${router.pathname}/`.includes(path.replace('//', '/'));
  };

  const isSelectedItem = (path) => {
    return selectedItem.includes(path.replace('//', '/'));
  };

  useEffect(() => {
    const basePath = `${router.pathname}/`;

    const item = basePath.substring(0, basePath.slice(5).indexOf('/') + 5);

    const sub = basePath
      .replace(item, '')
      .substring(0, basePath.replace(item, '').slice(5).indexOf('/') + 5);

    setSelectedItem(item);

    if (sub.length > 1) {
      setOpennedItem(true);
      setDescOpennedItem(item);
    }
  }, []);

  const getSubMenus = (menuPath: string, subMenus: Array<SubMenu>) => {

    let listaSubMenus: Array<SubMenu>;

    if (userAdmin) {
      listaSubMenus = subMenus.filter((item) => item.user);
    } else if (userLogged) {
      listaSubMenus = subMenus.filter((item) => item.user && !item.adm);
    } else if (clientLogged) {
      listaSubMenus = subMenus.filter((item) => item.client);
    }

    return (
      <Collapse
        timeout="auto"
        unmountOnExit
        in={isSelectedItem(menuPath) && opennedItem}
      >
        {listaSubMenus.map((sub, subKey) => {
          return (
            <Box
              // eslint-disable-next-line react/no-array-index-key
              key={subKey}
              className={
                isCurrentPath(`${menuPath}/${sub.path}`)
                  ? classes.subSelectedBox
                  : classes.unselectedBox
              }
            >
              <ListItem
                className={classes.listItem}
                onClick={() => {
                  if (size.width < theme.breakpoints.values.lg) {
                    setDrawerOpen();
                  }
                  router.push(`${menuPath}/${sub.path}`);
                }}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <DotIcon
                    className={
                      isCurrentPath(`${menuPath}/${sub.path}`)
                        ? classes.iconSubItemSelected
                        : classes.iconSubItem
                    }
                  />
                </ListItemIcon>
                <ListItemText
                  unselectable="on"
                  primary={sub.label}
                  className={
                    isCurrentPath(`${menuPath}/${sub.path}`)
                      ? classes.listItemTextSelected
                      : classes.listItemText
                  }
                />
              </ListItem>
            </Box>
          );
        })}
      </Collapse>
    );
  };

  const getMenus = () => {

    let listaMenus: Array<Menu>;

    if (userAdmin) {
      listaMenus = sidebarItems.filter((item) => item.user);
    } else if (userLogged) {
      listaMenus = sidebarItems.filter((item) => item.user && !item.adm);
    } else if (clientLogged) {
      listaMenus = sidebarItems.filter((item) => item.client);
    }

    return (
      <Box
        height="100%"
        display="flex"
        flexDirection="column"
        className={
          size.width >= theme.breakpoints.values.lg
            ? classes.drawerContent
            : classes.drawerContentMobile
        }
      >
        <List>
          {listaMenus.map((item, itemKey) => {
            const Icon = item.icon;
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Box key={itemKey}>
                <Box
                  className={
                    isCurrentPath(item.path)
                      ? classes.itemSelectedBox
                      : classes.unselectedBox
                  }
                >
                  <ListItem
                    className={classes.listItem}
                    onClick={() => {
                      setOpennedItem(item.path !== selectedItem || !opennedItem);
                      setDescOpennedItem(item.path);
                      setSelectedItem(item.path);
                      if (!item.items) {
                        if (size.width < theme.breakpoints.values.lg) {
                          setDrawerOpen();
                        }
                        router.push(item.path);
                      }
                    }}
                  >
                    <ListItemIcon className={classes.listItemIcon}>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      unselectable="on"
                      primary={item.label}
                      className={classes.listItemText}
                    />
                    {item.items &&
                      (descOpennedItem === item.path && opennedItem ? (
                        <ExpandLessIcon className={classes.collapsedIcon} />
                      ) : (
                        <ExpandMoreIcon className={classes.collapsedIcon} />
                      ))}
                  </ListItem>
                </Box>
                {Boolean(item.items) && getSubMenus(item.path, item.items) }
              </Box>
            );
          })}
        </List>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isDrawerOpen}
      variant={
        size.width >= theme.breakpoints.values.lg ? 'persistent' : 'temporary'
      }
      onClose={setDrawerOpen}
      classes={{
        paper:
          size.width >= theme.breakpoints.values.lg
            ? classes.drawer
            : classes.drawerMobile,
      }}
    >
      <Hidden lgUp>
        <Box className={classes.header}>
          <Tooltip
            title={`${isDrawerOpen ? 'Fechar' : 'Abrir'} menu`}
            placement="bottom"
            arrow
          >
            <MenuRoundedIcon
              className={classes.menuIcon}
              onClick={setDrawerOpen}
            />
          </Tooltip>
          <img
            src="/assets/images/Logo_Nizatech_Branco.png"
            alt="logo"
            className={classes.logo}
          />
        </Box>
      </Hidden>
      {getMenus()}
    </Drawer>
  );
}

export default Sidebar;
