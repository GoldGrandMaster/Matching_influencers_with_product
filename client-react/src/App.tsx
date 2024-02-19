import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CreateEmailGroup from './pages/CreateEmailGroup';
import ProductList from './pages/ProductList';
import InfluencerList from './pages/InfluencerList';
import MatchedInfluencers from './pages/MatchedInfluencers';
import AiWriteEmail from './pages/AiWriteEmail';
import AiRewriteEmail from './pages/AiRewriteEmail';
import CheckingEmail from './pages/CheckingEmail';
import EmailSentState from './pages/EmailSentState';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <div>Hello</div>
    },
    {
      path: "/product-list",
      element: <ProductList />
    },
    {
      path: "/influencer-list",
      element: <InfluencerList />
    },
    {
      path: "/create-email-group",
      element: <CreateEmailGroup />
    },
    {
      path: "/matched-influencers/:jobID",
      element: <MatchedInfluencers />
    },
    {
      path: "/ai-write-email/:jobID",
      element: <AiWriteEmail />
    },
    {
      path: "/ai-rewrite-email/:jobID",
      element: <AiRewriteEmail />
    },
    {
      path: "/checking-email/:jobID",
      element: <CheckingEmail />
    },
    {
      path: "/email-sent-state",
      element: <EmailSentState />
    }
  ]
)

const App = () => {
  return <div className='container mx-auto px-4 pt-5'>
    <RouterProvider router={router} />
  </div>
}

export default App;
