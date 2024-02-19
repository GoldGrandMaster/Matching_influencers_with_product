import React from 'react'
import Header from '../components/Header';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, OutlinedInput, Select } from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom'
import axios from 'axios';

const templates = [
    'avsdfs',
    'asdgwef',
    'gwvxdfdsf'
]
const backend_url = "http://170.130.55.228:5000";

const AiWriteEmail = () => {
    const [saveTemplateModal, setSaveTemplateModal] = React.useState(false);
    const [previewModal, setPreviewModal] = React.useState(false)
    const [sendingConfirmModal, setSendingConfirmModal] = React.useState(false);
    const [writingProcessModal, setWritingProcessModal] = React.useState(false);
    const [cancelConfirmModal, setCancelConfirmModal] = React.useState(false);

    const [senderName, setSenderName] = React.useState('')
    const [companyName, setCompanyName] = React.useState('')
    const [companyIntro, setCompanyIntro] = React.useState('')

    const [influencers, setInfluencers] = React.useState(0);
    const {jobID} = useParams();
    const navigate = useNavigate();

    React.useEffect(() => {
        axios.post(`${backend_url}/get_influencer_matching_result`, { jobID })
            .then(res => {
                setInfluencers(res.data.influencer_data.length)
            })
    }, [])

    return (
        <div>
            <Header title="AI Write Email" step={1} />
            <div className='text-center my-7'>
                <h4 className='text-[30px] font-bold'>Sending email to {influencers} influencers</h4>
            </div>
            <div>
                <div className='border-b-2 border-[#000000] pb-1'>
                    <h5 className='text-[20px] font-bold'>Mail key information<span className='text-[14px] font-normal ml-5'>Fill in some key information, and the AI will use this information in the email content</span></h5>
                </div>
                <div className='my-5 grid grid-cols-2 gap-3 w-[40vw]'>
                    <span className='text-right'>
                        Information Template:
                    </span>
                    <Select size='small'>
                        {templates.map(template => <option key={template} value={template}>{template}</option>)}
                    </Select>
                    <span className='text-right'>
                        Senders Name:
                    </span>
                    <OutlinedInput placeholder='Name of the Sender' size='small' margin='dense' value={senderName} onChange={e => setSenderName(e.target.value)} />
                    <span className='text-right'>
                        Company Name:
                    </span>
                    <OutlinedInput placeholder='The company or brand' size='small' margin='dense' value={companyName} onChange={e => setCompanyName(e.target.value)} />
                    <span className='text-right'>
                        Company Introduction:
                    </span>
                    <OutlinedInput multiline placeholder='A brief introduction of the partner' minRows={5} size='small' margin='dense' value={companyIntro} onChange={e => setCompanyIntro(e.target.value)} />
                    <span className='text-right'>
                        Email Request:
                    </span>
                    <OutlinedInput multiline placeholder='Please enter your additional requirements for the email here (not required)' minRows={5} size='small' margin='dense' />
                </div>
                <div>
                    <Button variant='contained' color="inherit" onClick={() => setSaveTemplateModal(true)}>Save the current information as a template</Button>
                    <Dialog open={saveTemplateModal}>
                        <DialogTitle>
                            Template
                        </DialogTitle>
                        <DialogContent>
                            Template Name: <OutlinedInput margin='dense' size='small' />
                        </DialogContent>
                        <DialogActions>
                            <Button variant='outlined' onClick={() => setSaveTemplateModal(false)}>Cancel</Button>
                            <Button variant='contained' color="primary">Confirm</Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div className='flex justify-end mt-5'>
                    <div className='grid grid-cols-3 gap-4 w-[25vw]'>
                        <Button variant='outlined' onClick={() => navigate(`/matched-influencers/${jobID}`)}>Back</Button>
                        <Button variant='outlined' onClick={() => setPreviewModal(true)}>Write preview</Button>
                        <Button variant='contained' color="primary" onClick={() => setSendingConfirmModal(true)}>Next, AI Write</Button>
                    </div>
                    <Dialog fullWidth maxWidth="lg" open={previewModal}>
                        <DialogTitle>
                            Preview
                        </DialogTitle>
                        <DialogContent>
                            asdfasdfasdfasdfsd
                        </DialogContent>
                        <DialogActions>
                            <Button variant='outlined' onClick={() => setPreviewModal(false)}>Cancel</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={sendingConfirmModal}>
                        <DialogContent>
                            Are you sure you're going to write {influencers} emails?
                        </DialogContent>
                        <DialogActions>
                            <Button variant='outlined' onClick={() => setSendingConfirmModal(false)}>Cancel</Button>
                            <Button variant='contained' color='primary' onClick={() => {
                                setSendingConfirmModal(false);
                                setWritingProcessModal(true);
                                axios.post(`${backend_url}/ai_write_email`, {jobID, senderName, companyName, companyIntro})
                                .then(res => navigate(`/checking-email/${res.data.jobID}`))
                            }}>Confirm</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={writingProcessModal} fullWidth maxWidth="lg">
                        <DialogTitle>
                            AI Writing
                        </DialogTitle>
                        <DialogContent>
                            <LinearProgress />
                            Processing...
                            <div className='text-center text-[20px]'>
                                It may take a long time, so you can log out and check back later
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button variant='outlined' onClick={() => setCancelConfirmModal(true)}>Cancel</Button>
                            <Button variant='contained' color='primary'>Back</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={cancelConfirmModal}>
                        <DialogContent>
                            Are you sure you can cancel the write?
                        </DialogContent>
                        <DialogActions>
                            <Button variant='outlined' onClick={() => setCancelConfirmModal(false)}>Cancel</Button>
                            <Button variant='contained' color='primary' onClick={() => {
                                setCancelConfirmModal(false);
                                setWritingProcessModal(false);
                            }}>Confirm</Button>
                        </DialogActions>
                    </Dialog>

                </div>
            </div>
        </div>
    )
}

export default AiWriteEmail;