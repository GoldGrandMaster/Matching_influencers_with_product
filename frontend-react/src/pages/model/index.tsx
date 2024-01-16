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
import AddInfluencerModal from './AddModal';
import axios from 'axios';

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
  id: 'no' | 'name' | 'prompt1' | 'prompt2' | 'prompt3' | 'description';
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
    id: 'name',
    label: 'Name',
    minWidth: 70,
    align: 'center',
  },
  {
    // influencer profile -> 20 hashtags
    id: 'prompt1',
    label: 'Prompt1',
    minWidth: 70,
    align: 'center',
  },
  {
    // product detail -> 5 buyer persona
    id: 'prompt2',
    label: 'Prompt2',
    minWidth: 70,
    align: 'center',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    // each buyer persona -> 5 hashtags
    id: 'prompt3',
    label: 'Prompt3',
    minWidth: 70,
    align: 'center',
  },
  {
    // description of model : advantages and disadvantages of model
    id: 'description',
    label: 'Description',
    minWidth: 70,
    align: 'center',
  }
];

interface Data {
  name: string;
  prompt1: string;
  prompt2: string;
  prompt3: string;
  description: string;
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

  const getInfluencerData = () => {
    new Promise((resolve, reject) => {
      axios.get("http://127.0.0.1:5000/get_data_models")
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
    getInfluencerData();
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
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.userid} onClick={() => handleRowClick(row["_id"]["$oid"])}>
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
      <AddInfluencerModal open={open} onClose={() => setOpen(false)} initData={dialInitData} mode={dialMode} />
    </>
  );
}
