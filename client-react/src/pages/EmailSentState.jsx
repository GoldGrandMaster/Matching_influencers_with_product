import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React from 'react'

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
        current_reach: true,
        nearest_communicator: "--",
        prompt: "--"
    },
    {
        influencer: 'T-series',
        follwers: "15214",
        country: "US",
        email: "124rfr1@gmail.com",
        current_reach: true,
        nearest_communicator: "--",
        prompt: "--"
    },
    {
        influencer: 'T-series',
        follwers: "15214",
        country: "US",
        email: "124rfr1@gmail.com",
        current_reach: true,
        nearest_communicator: "--",
        prompt: "--"
    },
    {
        influencer: 'T-series',
        follwers: "15214",
        country: "US",
        email: "124rfr1@gmail.com",
        current_reach: true,
        nearest_communicator: "--",
        prompt: "--"
    },
]


const EmailSendState = () => {
    return <div>
        <div className='p-4 border-b-2 border-[#000000] flex justify-between'>
            <span>Target Name, 10/18 <span className='p-1 text-white bg-[#11bb11] rounded-md'>Playing</span></span>
            <Button variant="outlined">Back</Button>
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
                            <TableCell align='center'>Current reach</TableCell>
                            <TableCell align='center'>Nearest communicator</TableCell>
                            <TableCell align='center'>Prompt</TableCell>
                            <TableCell align='center'>Operator</TableCell>
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
                                <TableCell align="center">
                                    <span className='p-1 bg-[#aaaaaa] rounded-md'>
                                        {influencer.current_reach ? "Sent" : "Unsent"}
                                    </span>
                                </TableCell>
                                <TableCell align="center">{influencer.nearest_communicator}</TableCell>
                                <TableCell align="center">{influencer.prompt}</TableCell>
                                <TableCell align="center">
                                    <Button>Email Detail</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    </div>
}

export default EmailSendState