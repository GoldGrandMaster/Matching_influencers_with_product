import { lazy } from 'react';

const Home = lazy(() => import('./home'))
const Product = lazy(() => import('./product'))
const Influencer = lazy(() => import('./influencer'))
const Model = lazy(() => import('./model'))

export {Home, Product, Influencer, Model};
