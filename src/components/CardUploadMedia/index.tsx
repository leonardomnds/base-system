import React from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  CardActions,
  Button,
  Input,
  InputLabel,
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { ToBase64 } from '../../util/functions';

const { v4: uuidv4 } = require('uuid');

const useStyles = makeStyles({
  root: {},
  boxMedia: {
    width: '100%',
    height: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: 140,
  },
  buttons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    justifyItems: 'flex-end',
  },
  input: {
    display: 'none',
  },
});

type Props = {
  image?: string,
  title: string
  setValue: (v: any) => void,
}

const CardUploadMedia = (props: Props) => {
  const classes = useStyles();
  const uuid = uuidv4();

  const { title, image, setValue } = props;

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
          <Typography variant="subtitle2">{title}</Typography>
        </CardContent>
        <Box className={classes.boxMedia}>
          {image ? (
            <img className={classes.image} src={image} alt={title} />
          ) : (
            'Nenhuma imagem selecionada'
          )}
        </Box>
      </CardActionArea>
      <CardActions className={classes.buttons}>
        <Button
          size="small"
          color="primary"
          onClick={() => {
            setValue(null);
          }}
          component="span"
          disabled={!image}
        >
          Remover
        </Button>
        <InputLabel htmlFor={uuid}>
          <Input
            id={uuid}
            name={uuid}
            type="file"
            className={classes.input}
            onChange={async (evt: any) => {
              if (evt?.target?.files?.length > 0) {
                const imgbase64 = await ToBase64(evt.target.files[0]);
                setValue(imgbase64);
              }
            }}
          />
          <Button size="small" color="primary" component="span">
            Nova Imagem
          </Button>
        </InputLabel>
      </CardActions>
    </Card>
  );
}

export default CardUploadMedia;
