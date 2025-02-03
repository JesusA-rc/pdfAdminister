import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from '/src/Components/Header/Header'
import './App.css'
import UnirPdf from "./Pages/UnirPdf/UnirPdf";
import DividirPdf from "./Pages/DividirPdf/DividirPdf"
import Home from "./Pages/Home/Home";

function App() {

  return (
    <>
      <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unir-pdf" element={<UnirPdf />} />
        <Route path="/dividir-pdf" element={<DividirPdf/>} />
      </Routes>
    </Router>
    </>
  )
}

export default App
