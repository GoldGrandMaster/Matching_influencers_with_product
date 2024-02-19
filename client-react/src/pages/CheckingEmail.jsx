import { Button, Dialog, DialogActions, DialogContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import axios from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
const backend_url = "http://170.130.55.228:5000";

const CheckingEmail = () => {

    const [emailSendConfirmModal, setEmailSendConfirmModal] = React.useState(false);
    const [influencers, setInfluencers] = React.useState([])
    const [products, setProducts] = React.useState([])
    const [checkEmailModal, setCheckEmailModal] = React.useState(false);
    const [emailContent, setEmailContent] = React.useState({})
    const [influencerjobID, setInfluencerjobID] = React.useState("")
    const navigate = useNavigate()
    const { jobID } = useParams()

    React.useEffect(() => {
        axios.post(`${backend_url}/get_emails`, { jobID })
            .then(res => {
                setProducts(res.data.products);
                setInfluencers(res.data.influencers);
                setInfluencerjobID(res.data.influencerjobID);
            })
    }, [])

    return (
        <div>
            <div className='border-b-2 border-[#000000] pb-3'>
                <span className='text-[20px]'>Create AI email group</span>
                <div className='float-right'>
                    <div className='grid grid-cols-2 gap-3'>
                        <Button variant='outlined' onClick={() => navigate(`/ai-write-email/${influencerjobID}`)}>Back</Button>
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
                                    <TableCell align="center">{product.sample}</TableCell>
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
                                        {influencer.name}
                                    </TableCell>
                                    <TableCell align="center">{influencer.follwer}</TableCell>
                                    <TableCell align="center">{influencer.country}</TableCell>
                                    <TableCell align="center">{influencer.email}</TableCell>
                                    <TableCell align="center">{influencer.reason}</TableCell>
                                    <TableCell align="center">{influencer.prompt}</TableCell>
                                    <TableCell align="center">
                                        <Button onClick={() => {
                                            setEmailContent({ ...influencer.emailContent })
                                            setCheckEmailModal(true)
                                        }}>Check the Email</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Dialog open={checkEmailModal}>
                    <DialogContent>
                        <div className='p-5 m-auto'>
                            <h4 className='mb-3'>
                                {emailContent.subject}
                            </h4>
                            <p>
                                {emailContent.content}
                            </p>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button variant='contained' onClick={() => setCheckEmailModal(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    )
}

export default CheckingEmail