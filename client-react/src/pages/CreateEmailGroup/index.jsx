import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, LinearProgress, MenuItem, Modal, OutlinedInput, Paper, Radio, RadioGroup, Select, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material';
import React from 'react';
import Header from '../../components/Header';
import axios from 'axios'
import ProductsTable from './ProductsTable';
import { useNavigate } from 'react-router-dom'

const backend_url = "http://170.130.55.228:5000";
const mails = [
	'asdf@mail.com',
	'23fer@gmail.com'
]

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

const followers = [
	'All',
	'0 ~ 100',
	'100 ~ 500',
	'500 ~ 1000',
	'1000 ~'
]

const CreateEmailGroup = () => {
	const [matchingmodalstate, setMatchingModalState] = React.useState(false);
	const [childmodalstate, setChildModalState] = React.useState(false);
	const [selectedrows, setSelectedRows] = React.useState([]);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const [page, setPage] = React.useState(0);
	const [addProductModal, setAddProductModal] = React.useState(false)
	const [countries, setCountries] = React.useState(['All']);

	const navigate = useNavigate()
	React.useEffect(() => {
		axios.get(`${backend_url}/get_country`)
			.then(res => {
				setCountries(['All', ...res.data])
			})
	}, [])

	const [rows, setRows] = React.useState([]);

	const [filterFields, setFilterFields] = React.useState({
		platform: "nolimit",
		email: 'musthave',
		country: 'All',
		followers: "0"
	})

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const getProductData = () => {
		new Promise((resolve, reject) => {
			axios.get(`${backend_url}/get_data_products`)
				.then(res => {
					setRows([...res.data]);
				})

		})
	}

	const run = () => {
		setMatchingModalState(true);
		console.log(filterFields);
		new Promise((resolve, reject) => {
			axios.post(`${backend_url}/run`, { products: selectedrows.map(row => row['asin']), filterFields })
				.then(res => {
					if(res.data.notfound)
						navigate('/matched-influencers/nomatched')
					if (res.data.jobID)
						navigate(`/matched-influencers/${res.data.jobID}`)
				})
		})
	}


	React.useEffect(() => {
		getProductData();
	}, [])




	return <div>
		<Header title="create AI email group" step={0} />
		<div>
			<h4 className='font-bold mb-4'>
				Basic Information
			</h4>
			<div className='p-3 grid grid-cols-2 w-[20vw] gap-4'>
				<span>Mail Group name: </span>
				<OutlinedInput size='small' />
				<span>Sending email:</span>
				<Select size='small'>
					{
						mails.map(mail => {
							return <MenuItem key={mail} value={mail}>{mail}</MenuItem>
						})
					}
				</Select>
			</div>
		</div>
		<div className='mt-4'>
			<span className='mb-2 mr-5 text-[25px]'>Products</span>
			<Button color='primary' variant='contained' size='small' onClick={() => setAddProductModal(true)}>Add Products</Button>
			<Dialog open={addProductModal} fullWidth maxWidth="lg">
				<DialogTitle>
					Add Products
				</DialogTitle>
				<DialogContent>
					<ProductsTable selectedrows={selectedrows} setSelectedRows={setSelectedRows} rows={rows} setRows={setRows} />
				</DialogContent>
				<DialogActions>
					<Button variant='contained' onClick={() => setAddProductModal(false)}>OK</Button>
				</DialogActions>
			</Dialog>
		</div>
		<div>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell align='center'>SKU</TableCell>
							<TableCell align='center'>Country</TableCell>
							<TableCell align='center'>Platform</TableCell>
							<TableCell align='center'>ASIN</TableCell>
							<TableCell align='center'>Product title</TableCell>
							<TableCell align='center'>Link</TableCell>
							<TableCell align='center'>Available Sample</TableCell>
							<TableCell align='center'>operation</TableCell>
						</TableRow>
					</TableHead>
					{selectedrows.length != 0 ?
						<TableBody>
							{selectedrows
								.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((row) => (
									<TableRow
										key={row.sku}
										sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
									>
										<TableCell component="th" scope="row" align='center'>
											{row.sku}
										</TableCell>
										<TableCell align="center">{row.country}</TableCell>
										<TableCell align="center">{row.platform}</TableCell>
										<TableCell align="center">{row.asin}</TableCell>
										<TableCell align="center">{row.title}</TableCell>
										<TableCell align="center">{row.link}</TableCell>
										<TableCell align="center">{row.available_sample}</TableCell>
										<TableCell align="center">
											<Button color="error" onClick={() => {
												setSelectedRows([...selectedrows.filter(item => item._id['$oid'] != row._id['$oid'])])
											}}>delete</Button>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
						: ''
					}
				</Table>
			</TableContainer>
			{selectedrows.length == 0 ? <h4 className='text-[24px] text-center py-7'>No selected products</h4> : ''}
			<TablePagination
				rowsPerPageMenuItems={[5, 10, 25]}
				component="div"
				count={selectedrows.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</div>
		<div className='mt-4 border-b-2 border-[#000000]'>
			<span className='font-bold text-[20px]'>
				Filter fields
			</span>
		</div>
		<div className='p-4 grid grid-rows-4 border-b-2 border-[#000000]'>
			<FormControl>
				<FormLabel id="platform">Platform</FormLabel>
				<RadioGroup
					row
					aria-labelledby="platform"
					name="platform"
					value={filterFields.platform}
					onChange={e => setFilterFields({ ...filterFields, platform: e.target.value })}
				>
					<FormControlLabel value="nolimit" control={<Radio />} label="No limit" />
					<FormControlLabel value="tiktok" control={<Radio />} label="TikTok" />
					<FormControlLabel value="youtube" control={<Radio />} label="Youtube" />
				</RadioGroup>
			</FormControl>

			<FormControl>
				<FormLabel id="email">Email</FormLabel>
				<RadioGroup
					row
					aria-labelledby="email"
					name="email"
					value={filterFields.email}
					onChange={e => setFilterFields({ ...filterFields, email: e.target.value })}
				>
					<FormControlLabel value="nolimit" control={<Radio />} label="No limit" />
					<FormControlLabel value="musthave" control={<Radio />} label="Must have" />
				</RadioGroup>
			</FormControl>

			<span className='mt-3'>Country: &nbsp;
				<Select
					size='small'
					className='w-[150px]'
					MenuProps={MenuProps}
					value={filterFields.country}
					onChange={e => setFilterFields({
						...filterFields,
						country: e.target.value
					})
					}>
					{
						countries.map(country => {
							return <MenuItem key={country} value={country}>{country}</MenuItem>
						})
					}
				</Select>
			</span>

			<span className='mt-3'>Followers: &nbsp;
				<Select
					size='small'
					className='w-[150px]'
					MenuProps={MenuProps}
					value={filterFields.followers}
					onChange={e => setFilterFields({
						...filterFields,
						followers: e.target.value
					})}
				>
					{
						followers.map((follower, i) => {
							return <MenuItem key={follower} value={i}>{follower}</MenuItem>
						})
					}
				</Select>
			</span>
		</div>
		<div className='mt-5 grid grid-rows-2 gap-2'>
			{
				selectedrows
					.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
					.map(row => {
						return (
							<div>
								<h4 className='text-[20px]'>{row.title}</h4>
								<div className='p-5'>
									<span className='flex'>
										Detail:&nbsp;&nbsp;<TextField multiline minRows={4} fullWidth value={row.detail} />
									</span>
								</div>
							</div>
						)
					})
			}
		</div>
		<div className='grid grid-cols-2 gap-4 p-5'>
			<Button variant='outlined'>Cancel</Button>
			<Button variant='contained' color='primary' onClick={run}>Start matching influencers</Button>
		</div>

		<Dialog fullWidth maxWidth="lg" open={matchingmodalstate} onClose={() => setMatchingModalState(false)}>
			<DialogTitle>
				Influencers matching
			</DialogTitle>
			<DialogContent className='container mx-auto'>
				<LinearProgress />
				Processing...
				<div className='text-center text-[20px]'>
					The match may take a long time, so you can log out and check back later
				</div>
			</DialogContent>
			<DialogActions>
				<Button variant='outlined' onClick={() => setChildModalState(true)}>Cancel</Button>
				<Button variant='contained' color='primary'>Back</Button>
			</DialogActions>
		</Dialog>

		<Dialog open={childmodalstate}>
			<DialogContent>
				Are you sure you can cancel the match?
			</DialogContent>
			<DialogActions>
				<Button variant='outlined' onClick={() => setChildModalState(false)}>Cancel</Button>
				<Button variant='contained' color='primary' onClick={() => {
					setChildModalState(false);
					setMatchingModalState(false);
				}}>Confirm</Button>
			</DialogActions>
		</Dialog>
	</div>
}

export default CreateEmailGroup