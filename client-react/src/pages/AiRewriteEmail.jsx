import React from 'react'
import Header from '../components/Header';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, MenuItem, OutlinedInput, Select } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
const backend_url = "http://170.130.55.228:5000";

const languages = [
    "English",
    "Chinese",
    "Spanish"
]

const AIRewriteEmail = () => {
    const [previewModal, setPreviewModal] = React.useState(false)
    const [directlyConfirmModal, setDirectlyConfirmModal] = React.useState(false)
    const [writingConfirmModal, setWritingConfirmModal] = React.useState(false)
    const [writingProcessModal, setWritingProcessModal] = React.useState(false)
    const [cancelConfirmModal, setCancelConfirmModal] = React.useState(false)
    
    const [language, setLanguage] = React.useState('English');
    const [title, setTitle] = React.useState("")
    const [prompt, setPrompt] = React.useState("")
    const [mailContent, setMailContent] = React.useState("")

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
            <Header title="AI Rewrite Email" step={0} />
            <div className='text-center my-7'>
                <h4 className='text-[30px] font-bold'>Sending email to {influencers} influencers</h4>
            </div>
            <div>
                <div>
                    <h4 className='text-[20px] font-bold'>
                        Ai referecence email
                    </h4>
                    <p>
                        AI will write this email to ensure that each email sent to Internet is somewhtat different, you canfreeze some statement information not to write
                    </p>
                    <div className='mt-5 p-3'>
                        <p>Title: <OutlinedInput placeholder="Please enter email write" size='small' margin='dense' value={title} onChange={e => setTitle(e.target.value)} /></p>
                        <OutlinedInput multiline minRows={10} className='mt-4' fullWidth value={mailContent} onChange={e => setMailContent(e.target.value)} />
                        <div className='mt-5 grid grid-cols-2 gap-3 w-[30vw]'>
                            <span className='text-right'>Language</span>
                            <Select size="small" value={language} onChange={e => setLanguage(e.target.value)}>
                                {languages.map(language => {
                                    return <MenuItem key={language} value={language}>{language}</MenuItem>
                                })}
                            </Select>
                            <span className='text-right'>Prompt</span>
                            <OutlinedInput size='small' margin='dense' multiline minRows={10} placeholder='Please enter your demind for email rewriting here' value={prompt} onChange={e => setPrompt(e.target.value)} />
                        </div>
                        <div className='flex justify-end'>
                            <div className='w-[40vw] grid grid-cols-4 gap-3'>
                                <Button variant="outlined" onClick={() => navigate(`/matched-influencers/${jobID}`)}>Back</Button>
                                <Button variant="outlined" onClick={() => setPreviewModal(true)}>Rewrite Preview</Button>
                                <Button variant="outlined" onClick={() => setDirectlyConfirmModal(true)}>Don't rewrite, send the email directly</Button>
                                <Button variant="contained" onClick={() => setWritingConfirmModal(true)}>Next, AI Rewrite</Button>
                            </div>
                            <Dialog open={previewModal} fullWidth maxWidth='lg' onClose={() => setPreviewModal(false)}>
                                <DialogContent>
                                    asdfasdfasdf
                                </DialogContent>
                            </Dialog>
                            <Dialog open={directlyConfirmModal}>
                                <DialogContent>
                                    Are you sure send the original email directly?
                                </DialogContent>
                                <DialogActions>
                                    <Button variant='outlined' onClick={() => setDirectlyConfirmModal(false)}>Cancel</Button>
                                    <Button variant='contained'>Confirm</Button>
                                </DialogActions>
                            </Dialog>
                            <Dialog open={writingConfirmModal}>
                                <DialogContent>
                                    About to rewrite {influencers} emails, are you sure?
                                </DialogContent>
                                <DialogActions>
                                    <Button variant='outlined' onClick={() => setWritingConfirmModal(false)}>Cancel</Button>
                                    <Button variant='contained' onClick={() => {
                                        setWritingConfirmModal(false);
                                        setWritingProcessModal(true);
                                        axios.post(`${backend_url}/ai_rewrite_email`, {
                                            jobID, title, mailContent, language, prompt
                                        })
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
                                    <Button variant='outlined' onClick={() => setCancelConfirmModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant='contained' onClick={() => {
                                        setCancelConfirmModal(false)
                                        setWritingProcessModal(false)
                                    }}>Confirm</Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIRewriteEmail;