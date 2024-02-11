import { Step, StepLabel, Stepper } from '@mui/material';
import React from 'react'

const steps = [
    'Matching Influencers',
    'Send Email',
];

const Header = (props) => {
    const [activeStep, setActiveStep] = React.useState(props.step);

    return (
        <>
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