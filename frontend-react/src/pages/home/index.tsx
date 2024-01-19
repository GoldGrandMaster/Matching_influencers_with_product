import * as React from 'react';
import { useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles';
import MuiGrid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
// import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import AddInfluencerModal from '../influencer/AddModal';
import axios from 'axios';
import SendEmailModal from './SendEmailModal';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    height: '100%'
}));

const Grid = styled(MuiGrid)(({ theme }) => ({
    height: '100%',
}))

const initialRanks = [
    {
        no: 1,
        name: 'agron kercishta',
        reason: 'He is best matching person.',
        isOpened: false
    },
    {
        no: 2,
        name: 'oleksii krupiak',
        reason: 'He is best matching person. He is most matching in this field',
        isOpened: false
    },
    {
        no: 3,
        name: 'william holloway',
        reason: 'He is best matching person.',
        isOpened: false
    },
    {
        no: 4,
        name: 'antonio cello',
        reason: 'He is best matching person.',
        isOpened: false
    },
    {
        no: 5,
        name: 'richard scott',
        reason: 'He is best matching person.',
        isOpened: false
    },
    {
        no: 1,
        name: 'agron kercishta',
        reason: 'He is best matching person.',
        isOpened: false
    },
    {
        no: 2,
        name: 'oleksii krupiak',
        reason: 'He is best matching person.',
        isOpened: false
    },
    {
        no: 3,
        name: 'william holloway',
        reason: 'He is best matching person.',
        isOpened: false
    },
    {
        no: 4,
        name: 'antonio cello',
        reason: 'He is best matching person.',
        isOpened: false
    },
    {
        no: 5,
        name: 'richard scott',
        reason: 'He is best matching person.',
        isOpened: false
    },
]

const Home = (props: any) => {
    const [message, setMessage] = React.useState('Here is log history.');
    const [ranks, setRanks] = React.useState(initialRanks.slice(0, 5));
    const [ranksNum, setRanksNum] = React.useState(5);
    const [curModel, setCurModel] = React.useState('');
    const [models, setModels] = React.useState<any[]>([]);
    const [description, setDescription] = React.useState('');
    const [productdetails, setProductdetails] = React.useState('');
    const historyRef = React.useRef<EventSource>();
    const [open, setOpen] = React.useState(false);
    const [emailOpen, setEmailOpen] = React.useState(false)
    const [dialInitData, setDialogInitData] = React.useState({});
    const [curName, setCurName] = React.useState('');

    const navigate = useNavigate();

    const onHistoryReceive = (event: any) => {
        console.log(event);
        setMessage(event.data);
    }

    React.useEffect(() => {
        // axios.get("/").then(response => {
        //     setMessage(response.data);
        // })
        getModelData();

        const source = new EventSource('http://127.0.0.1:5000/history');
        historyRef.current = source;
        if (historyRef.current) {
            historyRef.current.addEventListener('message', onHistoryReceive)
        }

        return () => {
            if (historyRef.current) {
                historyRef.current.close();
            }
        }
    }, []);

    React.useEffect(() => {
        if (curModel != '') setDescription(models.filter(i => i.name == curModel)[0].description);
    }, [curModel])

    const getModelData = () => {
        new Promise((resolve, reject) => {
            axios.get("http://127.0.0.1:5000/get_data_models")
                .then(res => {
                    setModels([...res.data]);
                    setCurModel(res.data[0].name)
                })
        })
    }

    const onHandleRun = () => {
        new Promise((resolve, reject) => {
            axios.post("http://127.0.0.1:5000/run", { productdetails, curModel })
                .then(res => {
                    console.log('Running result', res.data)
                    setRanks(res.data.slice(0, ranksNum));
                })
        })
    }

    const generateEmail = () => {
        return new Promise((resolve, reject) => {
            axios.post("http://127.0.0.1:5000/generate_email", { name: curName, productdetails, curModel })
                .then(res => {
                    // console.log(res.data);
                    resolve(res.data)
                }).catch(err => reject(err))
        })
    }

    const handleToggleReason = (idx: number) => {
        let tmp = [...ranks];
        tmp[idx].isOpened = !tmp[idx].isOpened
        console.log(idx, tmp);
        setRanks(tmp);
    }

    const handleToggleEmailModal = (name: string) => {
        setCurName(name);
        setEmailOpen(true);
    }

    const handleNameClick = (name: string) => {
        console.log(name);
        new Promise((resolve, reject) => {
            axios.post("http://127.0.0.1:5000/find_profile", { name })
                .then(res => {
                    let data = JSON.parse(res.data);
                    // setRanks(res.data.slice(0, ranksNum));
                    setDialogInitData(data)
                    setOpen(true)
                })
        })
    }

    return (
        <>
            <Paper sx={{ flexGrow: 1 }}>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid xs={4}>
                        <Item className='flex flex-col gap-y-2'>
                            <div className="mb-2">

                                <p>Product Details</p>
                                <TextField
                                    id="outlined-multiline-flexible"
                                    fullWidth
                                    multiline
                                    rows={20}
                                    className='h-full'
                                    value={productdetails}
                                    onChange={e => setProductdetails(e.target.value)}
                                />
                            </div>
                            <div className='flex flex-col'>
                                <p>Model</p>
                                <div className='flex gap-x-2 w-full'>
                                    <Select value={curModel} fullWidth onChange={(e) => setCurModel(e.target.value)}>
                                        {
                                            models.map((model: any) => <MenuItem key={model.name} value={model.name}>{model.name}</MenuItem>)
                                        }
                                    </Select>
                                    <Button size='medium' variant="contained" onClick={() => navigate("/model")}>Customize</Button>
                                </div>
                            </div>
                            <div className="mb-2">
                                <p>Description</p>
                                <TextField
                                    id="outlined-multiline-flexible"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={description}
                                    className='h-full'
                                />
                            </div>
                        </Item>
                    </Grid>
                    <Grid xs={4}>
                        <Item>
                            <Button size='medium' className='float-right' variant="contained" color='secondary' onClick={onHandleRun}>Run</Button>
                            <h1>Log</h1>
                            <div>
                                {message}
                            </div>
                        </Item>
                    </Grid>
                    <Grid xs={4}>
                        <Item>
                            <div className="mb-2 flex gap-x-2 items-center">
                                <p>Number of ranking: </p>
                                <TextField
                                    id="outlined-multiline-flexible"
                                    className='h-full w-[100px]'
                                    size='small'
                                    type='number'
                                    value={ranksNum}
                                    onChange={(e: any) => {
                                        setRanksNum(e.target.value);
                                        setRanks(initialRanks.slice(0, e.target.value));
                                    }}
                                />
                            </div>
                            <h1>Final ranking</h1>
                            <List>
                                {
                                    ranks.map((rank: any, index: number) =>
                                        <div key={index} className="flex flex-col mb-2 gap-y-2">
                                            <div className='flex items-center justify-between'>
                                                <span className="cursor-pointer" onClick={() => handleNameClick(rank.name)}>{index + 1}. {rank.name}</span>
                                                <div className="flex gap-x-2">
                                                    <Button size='small' variant="outlined"
                                                        onClick={() => handleToggleReason(index)}>...</Button>
                                                    <Button size='small' variant="outlined"
                                                        onClick={() => handleToggleEmailModal(rank.name)}>Send</Button>
                                                </div>
                                            </div>
                                            <div style={{ display: rank.isOpened ? "flex" : "none" }} className="ml-4">{rank.reason}</div>

                                        </div>)
                                }
                            </List>
                        </Item>
                    </Grid>
                </Grid>
            </Paper>
            <AddInfluencerModal open={open} onClose={() => setOpen(false)} initData={dialInitData} mode={"read"} />
            <SendEmailModal open={emailOpen} onClose={() => setEmailOpen(false)} generateEmail={generateEmail} />
        </>
    );
}

export default Home;