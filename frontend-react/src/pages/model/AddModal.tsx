import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import axios from "axios";
import { useState } from "react";

const AddInfluencerModal = ({
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

    const handleDelete = () => {
        new Promise((resolve: any, reject: any) => {
            axios.delete("http://localhost:5000/delete_data_models", {
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
        let newData = {...formData};
        newData[field] = value;
        setFormData(newData);
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
                    axios.post("http://localhost:5000/add_data_models", formJson)
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
                label="Name"
                type="text"
                name="name"
                onChange={(e) => updateFormData("name", e.target.value)}
                defaultValue={initData.name}
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                label="Prompt1"
                name="prompt1"
                defaultValue={initData.userid}
                onChange={(e) => updateFormData("prompt1", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Prompt2"
                name="prompt2"
                defaultValue={initData.platform}
                onChange={(e) => updateFormData("prompt2", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Prompt3"
                name="prompt3"
                defaultValue={initData.country}
                onChange={(e) => updateFormData("prompt3", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Description"
                name="description"
                multiline={true}
                rows={2}
                defaultValue={initData.hashtag}
                onChange={(e) => updateFormData("Description", e.target.value)}
                type="text"
                fullWidth
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            { mode === "update" && <Button color="secondary" onClick={handleDelete}>Delete</Button>}
            <Button type="submit">{mode === "add" ? "Add" : "Update"}</Button>
        </DialogActions>
    </Dialog>
}

export default AddInfluencerModal;