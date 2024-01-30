import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import AddProductModal from './AddModal';
import axios from 'axios';

const backend_url = "http://170.130.55.228:5000";
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

interface Column {
  id: 'no' | 'asin' | 'title' | 'link' | 'detail';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  {
    id: 'no',
    label: 'No',
    minWidth: 20,
    align: 'center',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'asin',
    label: 'Asin',
    minWidth: 70,
    align: 'center',
  },
  {
    id: 'title',
    label: 'Title',
    minWidth: 70,
    align: 'center',
  },
  {
    id: 'link',
    label: 'Link',
    minWidth: 70,
    align: 'center',
  },
  {
    id: 'detail',
    label: 'Detail',
    minWidth: 70,
    align: 'center',
  }
];

interface Data {
  no: number;
  asin: string;
  title: string;
  link: string;
  detail: string;
}
export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [dialInitData, setDialogInitData] = React.useState<Data>({});
  const [dialMode, setDialMode] = React.useState<string>("add");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRowClick = (rowId: string) => {
    let target = rows.find((row: Data) => row["_id"].$oid === rowId);
    console.log(target);
    setDialogInitData(target);
    setDialMode("update");
    setOpen(true);
  }

  const getProductData = () => {
    new Promise((resolve, reject) => {
      axios.get(`${backend_url}/get_data_products`)
        .then(res => {
          let idx:number = 1;
          for(let row of res.data) {
            row["no"] = idx;
            idx ++;
          }
          setRows([...res.data]);
        })
      
    })
  }

  React.useEffect(() => {
    getProductData();
  }, [])

  return (
    <>
      <Paper sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <div className='flex justify-end bg-transparent gap-x-4'>
          <Button variant="contained" color='primary' onClick={() => { setOpen(true); setDialMode("add"); setDialogInitData({})}}>Add</Button>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        </div>
        <TableContainer className='overflow-y-auto'>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.asin} onClick={() => handleRowClick(row["_id"]["$oid"])}>
                      {columns.map((column: Column, idx: number) => {
                        let value: string = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <AddProductModal open={open} onClose={() => setOpen(false)} initData={dialInitData} mode={dialMode} />
    </>
  );
}
