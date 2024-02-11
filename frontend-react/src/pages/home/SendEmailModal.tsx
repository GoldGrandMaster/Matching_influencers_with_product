import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import axios from "axios";
import React from "react";
import { useState } from "react";


const SendEmailModal = ({
    open,
    onClose,
    generateEmail,
    regenerateEmail
}: {
    open: boolean,
    onClose: any,
    generateEmail: any,
    regenerateEmail: any
}) => {

    const [subject, setSubject] = React.useState("")
    const [message, setMessage] = React.useState("")
    const [senderName, setSenderName] = React.useState("");
    const [companyName, setCompanyName] = React.useState("");
    const [companyIntro, setCompanyIntro] = React.useState("");

    const handleAssist = () => {
        generateEmail({senderName, companyName, companyIntro}).then((data: any) => {
            console.log(data);
            setSubject(data.subject);
            setMessage(data.content);
        });
    }
    const handleRewrite = () => {
        regenerateEmail({subject, message}).then((data: any) => {
            console.log(data);
            setSubject(data.subject);
            setMessage(data.content);
        });
    }
    return <Dialog
        open={open}
        onClose={onClose}
        style={{width: '80%'}}
        PaperProps={{
            component: 'form',
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const formJson = Object.fromEntries((formData as any).entries());

                // new Promise((resolve: any, reject: any) => {
                //     axios.post("http://localhost:5000/add_data_influencers", formJson)
                //     .then((res) => {
                //         console.log(res.data);
                //         resolve();
                //     })
                //     .catch(err => { reject() })
                // })
            },
        }}
    >
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {/* To subscribe to this website, please enter your email address here. We
                will send updates occasionally. */}
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                label="To"
                placeholder="To: "
                type="text"
                name="receiver"
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                placeholder="Sender Name"
                name="sender_name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                placeholder="Company Name"
                name="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                placeholder="Company Introduction"
                name="company_introduction"
                value={companyIntro}
                onChange={(e) => setCompanyIntro(e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                placeholder="Subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                placeholder="Type your message here"
                name="message"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline={true}
                rows={15}
                fullWidth
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleAssist}>AI write</Button>
            <Button onClick={handleRewrite}>AI rewrite</Button>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit">Send</Button>

        </DialogActions>
    </Dialog>
}

export default SendEmailModal;