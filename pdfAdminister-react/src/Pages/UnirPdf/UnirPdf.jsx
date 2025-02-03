import React, { useState, useEffect } from 'react'
import styles from './UnirPdf.module.css'
import PdfViewer from '../../Components/PdfView/PdfView';
import Presentation from '../../Components/PresentationWeb/Presentation';
import { handleFileChange, handleDrop, handleDragOver, mergePdfs } from '/src/pdfFunctions';

const UnirPdf = () => {
  const [pdfUrls, setPdfUrls] = useState([]);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDragLeave = () => {
    setIsDragging(false); 
  };

  const handleDeleteFile = (index) => {
    setPdfUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
    setPdfFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));;
  };

  return (
    <div className={`${styles.unir_main} ${isDragging ? 'dragging' : ''}`}  onDragLeave={handleDragLeave} 
    onDrop={(e) => {handleDrop(e, setPdfUrls, setPdfFiles); setIsDragging(false)}} onDragOver={(e) => handleDragOver(e,setIsDragging)}>

      <div className={styles.unir_content}>
        {
          (isSmallScreen || pdfFiles.length === 0)  && 
          <Presentation 
            title='Unir archivos pdf'
            subtext='Combina tus PDFs sin complicaciones.'
            handleFileChange={(e) => handleFileChange(e, setPdfUrls, setPdfFiles)}
          />
        }

        <div className="content_wrap">
          {pdfUrls.map((file, index) => (
            <div className="content_wrap_element" key={index}>
              <p>{file.name}</p>
              <PdfViewer url={file.url} pageNum={1} />
              <button className="delete-button" onClick={() => handleDeleteFile(index)}>Eliminar</button>
            </div>
            
          ))}
        </div>
      </div>

      <button id="toggleSidebar" className="btn_toggle" onClick={toggleSidebar}>☰</button>

      <div className={`${styles.unirPdf} ${isSidebarOpen ? styles.active : ''}`}>
        <span className='main_h5_subtext'>Unir pdf</span>
        <div className={styles.unirPdf_information}>
          <span>Suelta los archivos pdf que quieras ingresar o presiona en 'Agregar archivos'</span>
        </div>

        <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileChange(e, setPdfUrls, setPdfFiles)} style={{ display: 'none' }}/>
        <button className="btn_main" onClick={() => mergePdfs(pdfFiles, setPdfUrls,setPdfFiles)}>Unir PDF</button>
      </div>
    </div>
  );
}

export default UnirPdf