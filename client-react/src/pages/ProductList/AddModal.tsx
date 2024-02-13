import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import axios from "axios";
import { useState } from "react";
const backend_url = "http://170.130.55.228:5000";

const AddProductModal = ({
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

    const handleUpdate = () => {
        let formdata = { ...initData, ...data };
        formdata._id = undefined;
        console.log(formdata);
        new Promise((resolve: any, reject: any) => {
            axios.post(`${backend_url}/update_data_products`, { data: formdata, _id: initData["_id"]["$oid"] })
                .then(res => {
                    console.log(res.data);
                    resolve();
                })
                .catch(err => { reject() })
        })
    }

    const handleDelete = () => {
        new Promise((resolve: any, reject: any) => {
            axios.delete(`${backend_url}/delete_data_products`, {
                data: { _id: initData["_id"]["$oid"] },
            })
                .then((res) => {
                    console.log(res.data);
                    resolve();
                })
                .catch(err => { reject() })
        })
    }

    const updateFormData = (field: String, value: String) => {
        let newData = { ...data };
        newData[field] = value;
        setData(newData);
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
                    axios.post(`${backend_url}/add_data_products`, formJson)
                        .then((res) => {
                            console.log(res.data);
                            resolve();
                        })
                        .catch(err => { reject() })
                })
            },
        }}
    >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {/* To subscribe to this website, please enter your email address here. We
                will send updates occasionally. */}
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                label="SKU"
                type="text"
                name="sku"
                defaultValue={initData.sku}
                onChange={(e) => updateFormData("sku", e.target.value)}
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                label="Country"
                type="text"
                name="country"
                defaultValue={initData.country}
                onChange={(e) => updateFormData("country", e.target.value)}
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                label="Platform"
                type="text"
                name="platform"
                defaultValue={initData.platform}
                onChange={(e) => updateFormData("platform", e.target.value)}
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                label="ASIN"
                type="text"
                name="asin"
                defaultValue={initData.asin}
                onChange={(e) => updateFormData("asin", e.target.value)}
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                label="Products Title"
                name="title"
                defaultValue={initData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Link"
                name="link"
                defaultValue={initData.link}
                onChange={(e) => updateFormData("link", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                label="Available sample"
                type="text"
                name="sample"
                defaultValue={initData.sample}
                onChange={(e) => updateFormData("sample", e.target.value)}
                fullWidth
            />
            <TextField
                margin="dense"
                label="Detail"
                name="detail"
                defaultValue={initData.detail}
                onChange={(e) => updateFormData("detail", e.target.value)}
                type="text"
                fullWidth
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button color="secondary" onClick={handleDelete}>Delete</Button>
            <Button onClick={mode === "add" ? undefined : handleUpdate} type={mode === "add" ? "submit" : "button"}>{mode === "add" ? "Add" : "Update"}</Button>
        </DialogActions>
    </Dialog>
}

export default AddProductModal;