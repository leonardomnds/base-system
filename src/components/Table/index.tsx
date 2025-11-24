import React, { useState, useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  LinearProgress,
  Box,
  Paper,
  Typography,
  Tooltip,
  ButtonGroup,
  Button,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/EditRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import CheckIcon from "@mui/icons-material/CheckCircleRounded";

import {
  SomenteNumeros,
  StringToDouble,
  FormatarStringToMoney,
  ZerosLeft,
} from "../../util/functions";

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    backgroundColor: theme.palette.background.paper,
  },
  root: {
    width: "100%",
  },
  head: {
    minHeight: 100,
  },
  headerItems: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 10,
  },
  cell: {
    padding: 6,
    paddingLeft: 20,
    paddingRight: 0,
  },
  contentCell: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    padding: 6,
    paddingLeft: 20,
    paddingRight: 0,
  },
  loading: {
    height: 5,
  },
  noDataContainer: {
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCell: {
    width: 20,
    position: "sticky",
    zIndex: 1,
    // right: -18,
    right: -10,
  },
  btnEdit: {
    width: 16,
    padding: 2,
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  btnDelete: {
    width: 16,
    padding: 2,
    color: theme.palette.error.contrastText,
    backgroundColor: theme.palette.error.main,
    "&:hover": {
      backgroundColor: theme.palette.error.main,
    },
  },
  btnIcon: {
    margin: 0,
    padding: 0,
    width: 16,
  },
  searchInput: {
    marginTop: 10,
    paddingRight: 20,
    width: "100%",
  },
  iconSearch: {
    color: "gray",
  },
  paginationBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 15,
  },
}));

export const getColumn = (
  id: string,
  label: string,
  minWidth: number,
  align: "center" | "left" | "right",
  formatar?: "none" | "upper" | "padleft4",
  ocultar: boolean = false
) => {
  return { id, label, minWidth, align, formatar: formatar || "none", ocultar };
};

export const getRow = (rowItems: Array<any>, columnsList: Array<any>) => {
  const row = {};

  if (rowItems.length === columnsList.length) {
    for (let i = 0; i < columnsList.length; i += 1) {
      for (let y = 0; y < rowItems.length; y += 1) {
        if (i === y) {
          row[columnsList[i].id] = rowItems[y];
        }
      }
    }
    return row;
  }
  return null;
};

type Props = {
  isLoading?: boolean;
  columns: Array<any>;
  rows: Array<any>;
  editFunction?: (v: any) => void;
  deleteFunction?: (v: any) => void;
  selectFunction?: (v: any) => void;
  selectIcon?: any;
  selectLabel?: string;
  clickFunction?: (v: any) => void;
  naoPreencherLinhasVazias?: boolean;
  naoPesquisar?: boolean;
  linhasPorPagina?: number;
};

function CustomTable({
  isLoading,
  columns,
  rows,
  editFunction,
  deleteFunction,
  selectFunction,
  selectIcon,
  selectLabel,
  clickFunction,
  naoPreencherLinhasVazias,
  naoPesquisar,
  linhasPorPagina = 10,
}: Props) {
  const classes = useStyles();

  const IconSelectIcon = selectIcon;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(linhasPorPagina);
  const [pesquisa, setPesquisa] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);

  let emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredRows.length - page * rowsPerPage);

  const filtrarLista = (consulta) => {
    let newRows = [];
    setPesquisa(consulta);

    if (!consulta) {
      newRows = rows;
    } else {
      rows.forEach((row) => {
        let incluir = false;

        columns.some((column, index) => {
          if (index > 0) {
            const value = row[column.id];

            if (typeof value === "string") {
              incluir = value.toLowerCase().includes(consulta.toLowerCase());

              if (!incluir && SomenteNumeros(value)) {
                incluir = SomenteNumeros(value).includes(consulta);
              }
            } else if (typeof value === "number") {
              incluir = Number(consulta) === value;

              if (!incluir) {
                incluir = StringToDouble(SomenteNumeros(consulta)) === value;
              }

              if (!incluir) {
                incluir =
                  FormatarStringToMoney(consulta) ===
                  FormatarStringToMoney(value.toString());
              }
            }
          }

          return incluir;
        });

        if (incluir) {
          newRows.push(row);
        }
      });
    }

    setFilteredRows(newRows);
    emptyRows =
      rowsPerPage - Math.min(rowsPerPage, newRows.length - page * rowsPerPage);
  };

  const formatarString = (value: any, type: string) => {
    switch (type) {
      case "padleft4":
        return ZerosLeft(value || "0", 4);
      case "upper":
        return (value || "").toString().toUpperCase();
      default:
        return (value || "").toString();
    }
  };

  const handleChangePage = (evt, numPage) => {
    setPage(numPage);
  };

  const handleChangeRowsPerPage = (evt) => {
    setRowsPerPage(+evt.target.value);
    handleChangePage(evt, 0);
  };

  const paginationRowsInfo = ({ from, to, count }) => {
    return `Listando ${from} - ${to} de ${count}`;
  };

  const getPagination = () => {
    return (
      <Box className={classes.paginationBox}>
        <TablePagination
          component="div"
          rowsPerPageOptions={[]}
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Exibir"
          labelDisplayedRows={paginationRowsInfo}
          getItemAriaLabel={(type) =>
            type === "next" ? "Próxima página" : "Página anterior"
          }
        />
      </Box>
    );
  };

  useEffect(() => {
    if (rows) {
      filtrarLista("");
    }
  }, [rows]);

  return (
    <Paper className={classes.root}>
      {naoPesquisar && getPagination()}
      {!naoPesquisar && (
        <Grid container className={classes.headerItems}>
          <Grid item xs={12} sm={4}>
            <TextField
              margin="dense"
              variant="outlined"
              // label="Pesquisar"
              placeholder="Pesquisar..."
              name="pesquisar"
              className={classes.searchInput}
              value={pesquisa}
              onChange={(event) => filtrarLista(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className={classes.iconSearch} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={naoPesquisar ? 12 : 8}>
            {getPagination()}
          </Grid>
        </Grid>
      )}
      <Box className={classes.loading}>{isLoading && <LinearProgress />}</Box>
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow className={classes.head}>
              {columns.map((column, key) => (
                <TableCell
                  // eslint-disable-next-line react/no-array-index-key
                  key={key}
                  align={column.align}
                  className={classes.cell}
                  style={{
                    minWidth: column.minWidth,
                    display: column.ocultar ? "none" : "",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {(editFunction || deleteFunction || selectFunction) && (
                <TableCell
                  // eslint-disable-next-line react/no-array-index-key
                  key="actions"
                  align="right"
                />
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, rowKey) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={rowKey}
                    onClick={
                      clickFunction ? () => clickFunction(row) : () => {}
                    }
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          className={classes.contentCell}
                          style={{
                            minWidth: column.minWidth,
                            display: column.ocultar ? "none" : "",
                          }}
                        >
                          {formatarString(value, column.formatar)}
                        </TableCell>
                      );
                    })}
                    {(editFunction || deleteFunction || selectFunction) && (
                      <TableCell
                        // eslint-disable-next-line react/no-array-index-key
                        key="actions"
                        align="right"
                        className={classes.actionCell}
                      >
                        <ButtonGroup size="small" variant="contained">
                          {editFunction && (
                            <Tooltip title="Editar" placement="top" arrow>
                              <Button
                                size="small"
                                className={classes.btnEdit}
                                onClick={() => {
                                  editFunction(row);
                                }}
                              >
                                <EditIcon className={classes.btnIcon} />
                              </Button>
                            </Tooltip>
                          )}
                          {deleteFunction && (
                            <Tooltip title="Excluir" placement="top" arrow>
                              <Button
                                size="small"
                                className={classes.btnDelete}
                                onClick={() => {
                                  deleteFunction(row);
                                }}
                              >
                                <DeleteIcon className={classes.btnIcon} />
                              </Button>
                            </Tooltip>
                          )}
                          {selectFunction && (
                            <Tooltip
                              title={selectLabel || "Selecionar"}
                              placement="top"
                              arrow
                            >
                              <Button
                                size="small"
                                className={classes.btnEdit}
                                onClick={() => {
                                  selectFunction(row);
                                }}
                              >
                                {selectIcon ? (
                                  <IconSelectIcon className={classes.btnIcon} />
                                ) : (
                                  <CheckIcon className={classes.btnIcon} />
                                )}
                              </Button>
                            </Tooltip>
                          )}
                        </ButtonGroup>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            {!naoPreencherLinhasVazias &&
              emptyRows > 0 &&
              filteredRows.length > 0 && (
                <TableRow style={{ height: emptyRows * 35 }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
          </TableBody>
        </Table>
      </TableContainer>
      {!filteredRows.length && (
        <Box className={classes.noDataContainer}>
          <Typography variant="body2">Não há dados para exibir</Typography>
        </Box>
      )}
    </Paper>
  );
}

export default CustomTable;