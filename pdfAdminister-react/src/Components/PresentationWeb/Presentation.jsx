import React from 'react'

const Presentation = ({title,subtext,tipo,handleFileChange}) => {
  return (
    <div>
        <div className='text_presentation'>
        <span className='main_h5'>{title}</span>
        <span className='main_h5_subtext'>{subtext}</span>
        <input  type="file" accept="application/pdf" style={{ display: "none" }} id="pdfInput" onChange={handleFileChange} multiple/>
        <button className="btn_main" onClick={() => document.getElementById("pdfInput").click()}>Seleccionar archivos pdf</button>
        </div>
    </div>
  )
}

export default Presentation