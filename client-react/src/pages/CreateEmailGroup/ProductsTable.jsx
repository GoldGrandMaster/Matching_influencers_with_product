import { Button, Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import React from 'react'
import axios from 'axios';

const ProductsTable = ({ selectedrows, setSelectedRows, rows, setRows }) => {

    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [page, setPage] = React.useState(0);

    const [unselectedrows, setUnselectedRows] = React.useState([])


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    React.useEffect(() => {
        setUnselectedRows([...rows.filter(item => {
            for (let i of selectedrows) {
                if (i._id['$oid'] == item._id['$oid'])
                    return false
            }
            return true
        })])
    })

    return (
        <>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align='center'>SKU</TableCell>
                            <TableCell align='center'>Country</TableCell>
                            <TableCell align='center'>Platform</TableCell>
                            <TableCell align='center'>ASIN</TableCell>
                            <TableCell align='center'>Product title</TableCell>
                            <TableCell align='center'>Link</TableCell>
                            <TableCell align='center'>Available Sample</TableCell>
                            <TableCell align='center'>Operation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {unselectedrows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => (
                                <TableRow
                                    key={row.sku}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row" align='center'>
                                        {row.sku}
                                    </TableCell>
                                    <TableCell align="center">{row.country}</TableCell>
                                    <TableCell align="center">{row.platform}</TableCell>
                                    <TableCell align="center">{row.asin}</TableCell>
                                    <TableCell align="center">{row.title}</TableCell>
                                    <TableCell align="center">{row.link}</TableCell>
                                    <TableCell align="center">{row.available_sample}</TableCell>
                                    <TableCell align='center'>
                                        <Button onClick={() => setSelectedRows([...selectedrows, row])}>Add</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={unselectedrows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    )
}

export default ProductsTable