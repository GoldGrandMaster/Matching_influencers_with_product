import { Button, Step, StepLabel, Stepper } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router-dom'

const steps = [
    'Matching Influencers',
    'Send Email',
];

const Header = (props) => {
    const [activeStep, setActiveStep] = React.useState(props.step);
    const navigate = useNavigate();
    return (
        <>
            <div className="m-2 grid grid-cols-4 gap-2">
                <Button variant='contained' onClick={() => navigate('/influencer-list')}>Influencers</Button>
                <Button variant='contained' onClick={() => navigate('/product-list')}>Products</Button>
                <Button variant='contained' onClick={() => navigate('/prompt-list')}>Prompts</Button>
            </div>
            <h3 className='border-b-2 border-[#000000] text-[20px]'>
                {props.title}
            </h3>
            <div className="flex justify-center my-5">
                <div className='w-[30vw]'>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => {
                            return (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                </div>
            </div>
        </>
    )
}

export default Header;