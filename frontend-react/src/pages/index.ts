import { lazy } from 'react';

const Home = lazy(() => import('./home'))
const Influencer = lazy(() => import('./influencer'))
const Model = lazy(() => import('./model'))

export {Home, Influencer, Model};
