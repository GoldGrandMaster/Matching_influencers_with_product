import React from 'react'
import Header from '../components/Header'
import { DataGrid } from '@mui/x-data-grid'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const products = [
    {
        sku: "123124",
        country: "US",
        platform: "amazon",
        asin: "asdf234",
        product_title: "USB asdfhwletjkhaflskdjfhlkjwhe sadhf2owe sadfrwer23r 234 23 re r",
        link: "http://amazon.com",
        available_sample: "12"
    },
    {
        sku: "12312werf",
        country: "US",
        platform: "amazon",
        asin: "asdf234",
        product_title: "USB asdfhwletjkhaflskdjfhlkjwhe sadhf2owe sadfrwer23r 234 23 re r",
        link: "http://amazon.com",
        available_sample: "12"
    }
]

const influencers = [
    {
        influencer: "T-series",
        followers: 42342,
        country: "US",
        email: "user@example.com",
        ai_recommendation_reason: "Very good",
        prompt: "--"
    },
    {
        influencer: "T-series",
        followers: 42342,
        country: "US",
        email: "user@example.com",
        ai_recommendation_reason: "Very good",
        prompt: "--"
    },
    {
        influencer: "T-series",
        followers: 42342,
        country: "US",
        email: "user@example.com",
        ai_recommendation_reason: "Very good",
        prompt: "--"
    }
]


const MatchedInfluencers = () => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const navigate = useNavigate();

    const [backconfirmmodal, setBackConfirmModal] = React.useState(false);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <div>
            <Header title="create AI email group" step={0} />
            <div>
                <h4 className='text-[40px]'>
                    2000 influencers have been matched
                </h4>
                <div>
                    <h4 className='text-[30px] font-bold mt-5'>
                        Products
                    </h4>
                    <div className='p-5 grid grid-cols-3 gap-4'>
                        {products.map(product => {
                            return (
                                <div>
                                    <p>
                                        {product.product_title}
                                    </p>
                                    <p>
                                        SKU: {product.sku}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div>
                    <h4 className='text-[30px] font-bold mt-5'>
                        Influencers
                    </h4>
                    <div>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align='center'>
                                            <Checkbox />
                                        </TableCell>
                                        <TableCell align='center'>Influencer</TableCell>
                                        <TableCell align='center'>Followers</TableCell>
                                        <TableCell align='center'>Country</TableCell>
                                        <TableCell align='center'>Email</TableCell>
                                        <TableCell align='center'>AI recommendation Reasons</TableCell>
                                        <TableCell align='center'>Prompt</TableCell>
                                        <TableCell align='center'>Operate</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {influencers
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((influencer, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row" align='center'>
                                                    <Checkbox />
                                                </TableCell>
                                                <TableCell align="center">{influencer.influencer}</TableCell>
                                                <TableCell align="center">{influencer.followers}</TableCell>
                                                <TableCell align="center">{influencer.country}</TableCell>
                                                <TableCell align="center">{influencer.email}</TableCell>
                                                <TableCell align="center">{influencer.ai_recommendation_reason}</TableCell>
                                                <TableCell align="center">{influencer.prompt}</TableCell>
                                                <TableCell align="center">
                                                    <Button color="error">delete</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={influencers.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </div>
                </div>
                <div className='flex justify-end mt-5'>
                    <div className='grid grid-cols-3 gap-4 w-[30vw]'>
                        <Button variant='outlined' onClick={() => setBackConfirmModal(true)}>Back</Button>
                        <Button variant='contained' color="primary" onClick={() => navigate('/ai-write-email')}>AI Write email</Button>
                        <Button variant='contained' color='primary' onClick={() => navigate('/ai-rewrite-email')}>AI ReWrite email</Button>
                    </div>
                    <Dialog open={backconfirmmodal} maxWidth='xs' fullWidth className='container mx-auto'>
                        <DialogContent>
                            <p>
                                After returning, the matched influencer will disappear.
                            </p>
                            <p>
                                Are you sure?
                            </p>
                        </DialogContent>
                        <DialogActions>
                            <Button variant='outlined' onClick={() => setBackConfirmModal(false)}>Cancel</Button>
                            <Button variant='contained' color='primary' onClick={() => {
                                setBackConfirmModal(false)
                            }}>Confirm</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default MatchedInfluencers