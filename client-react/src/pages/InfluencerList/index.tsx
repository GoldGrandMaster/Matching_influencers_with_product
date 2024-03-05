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
    id: 'no' | 'name' | 'email' | 'userid' | 'platform' | 'country' | 'hashtag' | 'profile' | 'follower' | 'total_video' | 'recent_30video_view' | 'recent_30video_like' | 'recent_30video_comment' | 'title_last_10video' | 'profile_last_10video' | 'total_hashtag';
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

const columns: Column[] = [
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
        id: 'userid',
        label: 'User ID',
        minWidth: 70,
        align: 'center',
    },
    {
        id: 'email',
        label: 'Email',
        minWidth: 70,
        align: 'center',
    },
    {
        id: 'platform',
        label: 'Platform',
        minWidth: 70,
        align: 'center',
        format: (value: number) => value.toLocaleString('en-US'),
    },
    {
        id: 'country',
        label: 'Country',
        minWidth: 70,
        align: 'center',
    },
    {
        id: 'hashtag',
        label: 'Hashtag',
        minWidth: 70,
        align: 'center',
    },
    {
        id: 'profile',
        label: 'InfluencerProfile',
        minWidth: 200,
        align: 'center',
    },
    {
        id: 'follower',
        label: 'Follower',
        minWidth: 50,
        align: 'center',
        format: (value: number) => value.toLocaleString('en-US'),
    },
    {
        id: 'total_video',
        label: 'TotalVideo',
        // label: 'Size\u00a0(km\u00b2)',
        minWidth: 50,
        align: 'center',
        format: (value: number) => value.toLocaleString('en-US'),
    },
    {
        id: 'recent_30video_view',
        label: 'Last30VideosView',
        minWidth: 70,
        align: 'center',
        format: (value: number) => value.toLocaleString('en-US'),
    },
    {
        id: 'recent_30video_like',
        label: 'Last30VideosLike',
        minWidth: 70,
        align: 'center',
        format: (value: number) => value.toFixed(2),
    },
    {
        id: 'recent_30video_comment',
        label: 'Last30VideosComment',
        minWidth: 70,
        align: 'center',
    },
    {
        id: 'title_last_10video',
        label: 'Last30VideosTitle',
        minWidth: 300,
        align: 'center',
    },
    {
        id: 'profile_last_10video',
        label: 'Last30VideosProfile',
        minWidth: 300,
        align: 'center',
    },
    {
        id: 'total_hashtag',
        label: 'TotalHashtag',
        minWidth: 300,
        align: 'center',
    }
];

interface Data {
    name: string;
    userid: string;
    email: string;
    platform: string;
    country: string;
    hashtag: string;
    profile: string;
    follower: string;
    total_video: number;
    recent_30video_view: string;
    recent_30video_like: string;
    recent_30video_comment: string;
    title_last_10video: string;
    profile_last_10video: string;
    total_hashtag: string[];
}

export default function StickyHeadTable() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [open, setOpen] = React.useState(false);
    const [rows, setRows] = React.useState<Data[]>([]);
    const [dialInitData, setDialogInitData] = React.useState<Data>({});
    const [dialMode, setDialMode] = React.useState<string>("add");
    const [searchword, setSearchword] = React.useState<string>("");
    const [count, setCount] = React.useState<number>(0);

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

    const handleGenHashtags = () => {
        new Promise((resolve, reject) => {
            axios.get(`${backend_url}/gen_hashtags`)
                .then(res => {
                    getInfluencerData()
                })

        })
    }

    const getInfluencerData = () => {
        new Promise((resolve, reject) => {
            axios.post(`${backend_url}/get_data_influencers`, {
                rowsPerPage, page, searchword
            })
                .then(res => {
                    let idx: number = 1;
                    let temp = []
                    for (let row of res.data.data) {
                        let d = JSON.parse(row)
                        d["no"] = idx;
                        temp.push(d)
                        idx++;
                    }
                    console.log(temp)
                    setRows([...temp]);
                    setCount(res.data.count)
                })
        })
    }
    const getInfluencerDataFromAPI = () => {
        new Promise((resolve, reject) => {
            axios.get(`${backend_url}/request_influencer_data`)
                .then(res => {
                    console.log(res);
                })
        })
    }
    React.useEffect(() => {
        getInfluencerData();
    }, [searchword, rowsPerPage, page])

    return (
        <>
            <Paper sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <div className='flex justify-end bg-transparent gap-x-4'>
                    <Button variant="contained" color='primary' onClick={getInfluencerDataFromAPI}>Request</Button>
                    <Button variant="contained" color='primary' onClick={() => { setOpen(true); setDialMode("add"); setDialogInitData({}) }}>Add</Button>
                    <Button variant="contained" color='primary' onClick={handleGenHashtags}>Gen hashtags</Button>
                    {/* <Button variant="contained" color='primary'>Search</Button> */}
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            value={searchword}
                            onChange={e => setSearchword(e.target.value)}
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
                            {rows.map((row: any) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.userid} onClick={() => handleRowClick(row["_id"]["$oid"])}>
                                        {columns.map((column: Column, idx: number) => {
                                            let value: any = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.format && typeof value === 'number'
                                                        ? column.format(value)
                                                        : column.id == "total_hashtag" && value ? value.join(", ") : column.id == 'hashtag' ? value.join(", ") : value}
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
                    count={count}
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
