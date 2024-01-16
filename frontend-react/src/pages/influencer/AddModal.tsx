import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import axios from "axios";
import { useState } from "react";

// const initData = {
//     "name": "ParentingPro_03",
//     "userid": "user_1203",
//     "platform": "TikTok",
//     "country": "United Kingdom",
//     "hashtag": "#EarlyParenting, #BabyJourney, #ParentingWins, #ChildRearing, #FamilyMoments",
//     "profile": "Sharing the joys and challenges of early parenting.",
//     "follower": "160k",
//     "total_video": 275,
//     "recent_30video_view": "2.9m",
//     "recent_30video_like": "81k",
//     "recent_30video_comment": "3.9k",
//     "title_last_10video": "Handling Toddler Tantrums, Baby Sign Language, First Foods for Babies, New Parent Support Groups, Nursery Room Ideas, Diaper Changing Tricks, Child Vaccination Schedule, Reading to Infants, Outdoor Safety for Kids, Parent-Child Bonding Activities",
//     "profile_last_10video": "Practical tips on managing toddler tantrums, teaching baby sign language, introducing solid foods, finding support as a new parent, creative nursery room decoration, diaper changing techniques, vaccination guide for children, benefits of reading to infants, ensuring safety during outdoor activities, ideas for bonding with your child."
// }

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
            axios.delete("http://localhost:5000/delete_data_influencers", {
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
                    axios.post("http://localhost:5000/add_data_influencers", formJson)
                    .then((res) => {
                        console.log(res.data);
                        resolve();
                    })
                    .catch(err => { reject() })
                })
            },
        }}
    >
        <DialogTitle>Add New Influencer</DialogTitle>
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
                label="UserID"
                name="userid"
                defaultValue={initData.userid}
                onChange={(e) => updateFormData("userid", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Platform"
                name="platform"
                defaultValue={initData.platform}
                onChange={(e) => updateFormData("platform", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Country"
                name="country"
                defaultValue={initData.country}
                onChange={(e) => updateFormData("country", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Hashtags"
                name="hashtag"
                multiline={true}
                rows={2}
                defaultValue={initData.hashtag}
                onChange={(e) => updateFormData("hashtag", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Profile"
                name="profile"
                multiline={true}
                rows={2}
                defaultValue={initData.profile}
                onChange={(e) => updateFormData("profile", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Followers"
                name="follower"
                defaultValue={initData.follower}
                onChange={(e) => updateFormData("follower", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Total Videos"
                name="total_video"
                defaultValue={initData.total_video}
                onChange={(e) => updateFormData("total_video", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Recent 30 video's Views"
                name="recent_30video_view"
                defaultValue={initData.recent_30video_view}
                onChange={(e) => updateFormData("recent_30video_view", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Recent 30 video's likes"
                name="recent_30video_like"
                defaultValue={initData.recent_30video_like}
                onChange={(e) => updateFormData("recent_30video_like", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Recent 30 video's comments"
                name="recent_30video_comment"
                defaultValue={initData.recent_30video_comment}
                onChange={(e) => updateFormData("recent_30video_comment", e.target.value)}
                type="text"
                fullWidth
            />
            <TextField
                margin="dense"
                label="Title of Last 10 Videos"
                name="title_last_10video"
                defaultValue={initData.title_last_10video}
                onChange={(e) => updateFormData("title_last_10video", e.target.value)}
                type="text"
                multiline={true}
                rows={3}
                fullWidth
            />
            <TextField
                margin="dense"
                label="Profile of the last 10 Videos"
                name="profile_last_10video"
                defaultValue={initData.profile_last_10video}
                onChange={(e) => updateFormData("profile_last_10video", e.target.value)}
                type="text"
                multiline={true}
                rows={3}
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