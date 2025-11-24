import cookie from 'js-cookie';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/router";

import { Avatar, Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
  avatarMenu: {
    minWidth: 100,
  },
}));

type Props = {
  user: string,
}

function Account(props: Props) {
  const classes = useStyles();
  const ref = useRef();
  const router = useRouter()
  const [isOpen, setOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const { user } = props;
  const isAuthenticated = Boolean(user);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignOut = () => {
    handleClose();
    cookie.remove('user');
    cookie.remove('token');
    router.replace('/login');
  };

  const handlePass = () => {
    handleClose();
    router.push('/app/alterar-senha')
  }

  const items = [
    {
      id: 1,
      label: 'Alterar senha',
      auth: true,
      onClick: handlePass,
    },
    {
      id: 2,
      label: 'Sair',
      auth: true,
      onClick: handleSignOut,
    },
  ];

  useEffect(() => {
    const getUser = () => {
      setUsername(JSON.parse(user)?.nome?.toUpperCase() || null);
      if (JSON.parse(user)?.id) {
        setAvatar(JSON.parse(user)?.cpf_cnpj ? null : `/api/usuarios/${JSON.parse(user)?.id}/avatar`);
      }
    }
    if (Boolean(user)) {
      getUser();
    }    
  }, [])

  return (
    <>
      <Avatar
        ref={ref}
        style={{ cursor: 'pointer' }}
        className={classes.avatar}
        onClick={handleOpen}
        alt={username}
        src={avatar || '/'}
      />
      {isAuthenticated && 
      <Menu
        className={classes.avatarMenu}
        anchorEl={ref.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={isOpen}
        onClose={handleClose}
      >
        {items.map((item) => {
          return isAuthenticated === item.auth ? (
            <MenuItem key={item.id} onClick={item.onClick}>
              {item.label}
            </MenuItem>
          ) : null;
        })}
      </Menu>
      }
    </>
  );
}

export default Account;
