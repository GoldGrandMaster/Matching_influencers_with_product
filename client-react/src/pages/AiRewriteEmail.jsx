import React from 'react'
import Header from '../components/Header';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, OutlinedInput, Select } from '@mui/material';

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

    return (
        <div>
            <Header title="AI Rewrite Email" step={0} />
            <div className='text-center my-7'>
                <h4 className='text-[30px] font-bold'>Sending email to 2000 influencers</h4>
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
                        <p>Title: <OutlinedInput placeholder="Please enter email write" size='small' margin='dense' /></p>
                        <OutlinedInput multiline minRows={10} className='mt-4' fullWidth />
                        <div className='mt-5 grid grid-cols-2 gap-3 w-[30vw]'>
                            <span className='text-right'>Language</span>
                            <Select size="small">
                                {languages.map(language => {
                                    return <option key={language} value={language}>{language}</option>
                                })}
                            </Select>
                            <span className='text-right'>Prompt</span>
                            <OutlinedInput size='small' margin='dense' multiline minRows={10} placeholder='Please enter your demind for email rewriting here' />
                        </div>
                        <div className='flex justify-end'>
                            <div className='w-[40vw] grid grid-cols-4 gap-3'>
                                <Button variant="outlined">Back</Button>
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
                                    About to rewrite 2000 emails, are you sure?
                                </DialogContent>
                                <DialogActions>
                                    <Button variant='outlined' onClick={() => setWritingConfirmModal(false)}>Cancel</Button>
                                    <Button variant='contained' onClick={() => {
                                        setWritingConfirmModal(false);
                                        setWritingProcessModal(true);
                                    }}>Confirm</Button>
                                </DialogActions>
                            </Dialog>
                            <Dialog open={writingProcessModal} fullWidth maxWidth="lg">
                                <DialogTitle>
                                    AI Writing
                                </DialogTitle>
                                <DialogContent>
                                    <LinearProgress />
                                    20% completed
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