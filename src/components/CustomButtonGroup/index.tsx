import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  SvgIconTypeMap,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDownRounded';
import { OverridableComponent } from '@mui/material/OverridableComponent';

const { v4: uuidv4 } = require('uuid');

const useStyles = makeStyles((theme: Theme) => ({
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
  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef(uuidv4());
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions: Array<{
    label: string,
    icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>,
    color: 'primary' | 'secondary',
    func: () => void,
  }> = [
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
