import { Button, Dialog, DialogActions, DialogContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React from 'react'
import { Navigate } from 'react-router-dom'

const products = [
    {
        sku: "US20201110",
        country: "US",
        channel: "Amazon",
        asin: "KQIQ2111",
        detail: "xxxxx",
        link: "https://www.amazon.com/dp/df2wgfwr",
        available_sample: 2
    },
    {
        sku: "US20201124",
        country: "US",
        channel: "Amazon",
        asin: "KQIQ2111",
        detail: "xxxxx",
        link: "https://www.amazon.com/dp/df2wgfwr",
        available_sample: 2
    },
    {
        sku: "US20201410",
        country: "US",
        channel: "Amazon",
        asin: "KQIQ2111",
        detail: "xxxxx",
        link: "https://www.amazon.com/dp/df2wgfwr",
        available_sample: 2
    },
    {
        sku: "US20201116",
        country: "US",
        channel: "Amazon",
        asin: "KQIQ2111",
        detail: "xxxxx",
        link: "https://www.amazon.com/dp/df2wgfwr",
        available_sample: 2
    }
]

const influencers = [
    {
        influencer: 'T-series',
        follwers: "15214",
        country: "US",
        email: "124rfr1@gmail.com",
        ai_recommendation_reason: "very good",
        prompt: "--"
    },
    {
        influencer: 'T-series',
        follwers: "15214",
        country: "US",
        email: "124rfr1@gmail.com",
        ai_recommendation_reason: "very good",
        prompt: "--"
    },
    {
        influencer: 'T-series',
        follwers: "15214",
        country: "US",
        email: "124rfr1@gmail.com",
        ai_recommendation_reason: "very good",
        prompt: "--"
    },
    {
        influencer: 'T-series',
        follwers: "15214",
        country: "US",
        email: "124rfr1@gmail.com",
        ai_recommendation_reason: "very good",
        prompt: "--"
    }
]

const CheckingEmail = () => {

    const [emailSendConfirmModal, setEmailSendConfirmModal] = React.useState(false);

    return (
        <div>
            <div className='border-b-2 border-[#000000] pb-3'>
                <span className='text-[20px]'>Create AI email group</span>
                <div className='float-right'>
                    <div className='grid grid-cols-2 gap-3'>
                        <Button variant='outlined'>Back</Button>
                        <Button variant='contained' onClick={() => setEmailSendConfirmModal(true)}>Send</Button>
                        <Dialog open={emailSendConfirmModal}>
                            <DialogContent>
                                Email about to be sent, are you sure?
                            </DialogContent>
                            <DialogActions>
                                <Button variant='outlined' onClick={() => setEmailSendConfirmModal(false)}>Cancel</Button>
                                <Button variant='contained'>Confirm</Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </div>
            </div>
            <div className='my-3'>
                <h4 className='text-[20px] my-5'>Products</h4>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align='center'>SKU</TableCell>
                                <TableCell align='center'>Country</TableCell>
                                <TableCell align='center'>Channel</TableCell>
                                <TableCell align='center'>ASIN</TableCell>
                                <TableCell align='center'>Detail</TableCell>
                                <TableCell align='center'>Link</TableCell>
                                <TableCell align='center'>Available Sample</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow
                                    key={product.sku}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row" align='center'>
                                        {product.sku}
                                    </TableCell>
                                    <TableCell align="center">{product.country}</TableCell>
                                    <TableCell align="center">{product.channel}</TableCell>
                                    <TableCell align="center">{product.asin}</TableCell>
                                    <TableCell align="center">{product.detail}</TableCell>
                                    <TableCell align="center">{product.link}</TableCell>
                                    <TableCell align="center">{product.available_sample}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <div className='my-3'>
                <h4 className='text-[20px] my-5'>Influencers</h4>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align='center'>Influencer</TableCell>
                                <TableCell align='center'>Followers</TableCell>
                                <TableCell align='center'>Country</TableCell>
                                <TableCell align='center'>Email</TableCell>
                                <TableCell align='center'>AI Recommendation Reasons</TableCell>
                                <TableCell align='center'>Prompt</TableCell>
                                <TableCell align='center'>Operate</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {influencers.map((influencer, index) => (
                                <TableRow
                                    key={index}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row" align='center'>
                                        {influencer.influencer}
                                    </TableCell>
                                    <TableCell align="center">{influencer.follwers}</TableCell>
                                    <TableCell align="center">{influencer.country}</TableCell>
                                    <TableCell align="center">{influencer.email}</TableCell>
                                    <TableCell align="center">{influencer.ai_recommendation_reason}</TableCell>
                                    <TableCell align="center">{influencer.prompt}</TableCell>
                                    <TableCell align="center">
                                        <Button>Check the Email</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    )
}

export default CheckingEmail