import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import {
  makeStyles,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
} from '@material-ui/core';

import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';

const { v4: uuidv4 } = require('uuid');

const useStyles = makeStyles((theme) => ({
  themeError: {
    backgroundColor: theme.palette.background.paper,
  },
  btn: {
    width: 20,
  },
  icon: {
    margin: 0,
    padding: 0,
    width: 20,
  },
}));

function CustomButtonGroup({ editFunction, deleteFunction }) {
  const classes = useStyles();
  const [open, setOpen] = useState('');
  const anchorRef = useRef(uuidv4());
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    {
      label: 'Editar',
      icon: EditIcon,
      color: 'primary',
      func: editFunction,
    },
    {
      label: 'Excluir',
      icon: DeleteIcon,
      color: 'secondary',
      func: deleteFunction,
    },
  ];

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const getIcon = () => {
    const Icon = actions[selectedIndex].icon;

    return <Icon className={classes.icon} />;
  };

  return (
    <>
      <ButtonGroup
        size="small"
        variant="contained"
        color={actions[selectedIndex].color}
        ref={anchorRef}
      >
        <Button
          size="small"
          className={classes.btn}
          onClick={() => {
            actions[selectedIndex].func();
            setSelectedIndex(0);
          }}
          color={actions[selectedIndex].color}
        >
          {getIcon()}
        </Button>
        <Button
          color={actions[selectedIndex].color}
          size="small"
          className={classes.btn}
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" style={{ zIndex: 9999 }}>
                  {actions.map((btn, index) => (
                    <MenuItem
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      // disabled={index === 2}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {btn.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

CustomButtonGroup.prototypes = {
  editFunction: PropTypes.func,
  deleteFunction: PropTypes.func,
};

export default CustomButtonGroup;
