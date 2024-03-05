import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import axios from "axios";
import { useState } from "react";
const backend_url = "http://170.130.55.228:5000";

const AddModelModal = ({
    open,
    onClose,
    initData,
    mode
}: {
    open: boolean,
    onClose: any,
    initData: any,
    mode: string
}) => {

    const [data, setData] = useState<any>({});

    const handleDelete = () => {
        new Promise((resolve: any, reject: any) => {
            axios.delete(`${backend_url}/delete_data_models`, {
                data: {_id: initData["_id"]["$oid"]},
        })
            .then((res) => {
                console.log(res.data);
                resolve();
            })
            .catch(err => { reject() })
        })
    }

    const updateFormData = (field: String, value: String) => {
        let newData = {...data};
        newData[field] = value;
        setData(newData);
    }

    const handleUpdate = () => {
        let formdata = {...initData, ...data};
        formdata._id = undefined;
        console.log(formdata);
        new Promise((resolve: any, reject: any) => {
            axios.post(`${backend_url}/update_data_models`, {data:formdata, _id:initData["_id"]["$oid"]})
            .then(res => {
                console.log(res.data);
                resolve();
            })
            .catch(err => {reject()})
        })
    }

    return <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
            component: 'form',
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const formJson = Object.fromEntries((formData as any).entries());

                new Promise((resolve: any, reject: any) => {
                    axios.post(`${backend_url}/add_data_models`, formJson)
                    .then((res) => {
                        console.log(res.data);
                        resolve();
                    })
                    .catch(err => { reject() })
                })
            },
        }}
    >
        <DialogTitle>Add New Model</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {/* To subscribe to this website, please enter your email address here. We
                will send updates occasionally. */}
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                label="User"
                type="text"
                name="user"
                defaultValue={initData.user}
                onChange={(e) => updateFormData("user", e.target.value)}
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                label="Influencer_Hashtag_Gen"
                name="influencer_hashtag_gen"
                defaultValue={initData.influencer_hashtag_gen}
                onChange={(e) => updateFormData("influencer_hashtag_gen", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Buyer_Persona_Gen"
                name="buyer_persona_gen"
                defaultValue={initData.buyer_persona_gen}
                onChange={(e) => updateFormData("buyer_persona_gen", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Persona_Hashtag_Gen"
                name="persona_hashtag_gen"
                defaultValue={initData.persona_hashtag_gen}
                onChange={(e) => updateFormData("persona_hashtag_gen", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Reason_Gen"
                name="reason_gen"
                defaultValue={initData.reason_gen}
                onChange={(e) => updateFormData("reason_gen", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Email_Write"
                name="email_write"
                defaultValue={initData.email_write}
                onChange={(e) => updateFormData("email_write", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Email_Rewrite"
                name="email_rewrite"
                defaultValue={initData.email_rewrite}
                onChange={(e) => updateFormData("email_rewrite", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Description"
                name="description"
                multiline={true}
                rows={2}
                defaultValue={initData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                type="text"
                fullWidth
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            { mode === "update" && <Button color="secondary" onClick={handleDelete}>Delete</Button>}
            <Button onClick={mode === "add" ? undefined : handleUpdate} type={mode === "add" ? "submit" : "button"}>{mode === "add" ? "Add" : "Update"}</Button>
        </DialogActions>
    </Dialog>
}

export default AddModelModal;