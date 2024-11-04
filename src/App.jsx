import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './Header'
import Footer from './Footer'
import Home from './Home'

function App() {
  return (
    <>
      <Header />
      <Home />
      <Footer />
    </>
  )
}

export default App
