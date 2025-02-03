import React, { useState,useEffect } from 'react'
import styles from './DividirPdf.module.css'
import PresentationWeb from '/src/components/PresentationWeb/Presentation'
import PdfViewer from '../../Components/PdfView/PdfView';
import RangeForm from '/src/Components/NumPages/RangeForm'
import { handleFileChange, handleDrop, handleDragOver, downloadPdfRange, downloadSelectedPages } from '/src/pdfFunctions';

export const DividirPdf = () => {
   const [pdfUrls, setPdfUrls] = useState([]);
   const [pdfFiles, setPdfFiles] = useState([]);
   const [pageRanges, setPageRanges] = useState([]);
   const [optSelected,setOptSelected] = useState(0);
   const [typeRange,setTypeRange] = useState(0);
   const [valueRangeStart,setValueRangeStart] = useState(0);
   const [valueRangeEnd,setValueRangeEnd] = useState(0);
   const isButtonDisabled = valueRangeEnd <= valueRangeStart || valueRangeStart < 1 || pageRanges.some((range) => { 
   const [startPage, endPage] = range.split(",").map(Number);
    return valueRangeEnd > endPage;
  });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
    const [selectedPages, setSelectedPages] = useState([]);
  
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

  const minEndPage = Math.min(
    ...pageRanges.map((range) => {
      const [, endPage] = range.split(",").map(Number);
      return endPage;
    }),
  );

   const handleDeleteFile = (index) => {
    setPdfUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
    setPdfFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPageRanges((prevPages) => prevPages.filter((_, i) => i !== index));
  };

  const handleCheckboxChange = (pageNum) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageNum)) {
        return prev.filter((page) => page !== pageNum);
      } else {
        return [...prev, pageNum];
      }
    });
  };

  return (
    <div className={styles.dividirPdf} onDrop={(e) => handleDrop(e, setPdfUrls, setPdfFiles,setPageRanges)}>
      <div className={styles.dividir_content}>
        {(isSmallScreen || pdfUrls.length === 0) && (
          <PresentationWeb
            title="Dividir PDF"
            subtext="Extrae páginas de tu PDF."
            handleFileChange={(e) => handleFileChange(e, setPdfUrls, setPdfFiles,setPageRanges)}
          />
        ) 
        }
        <div className="content_wrap">
        {pdfUrls.map((file, index) => {
        const range = pageRanges[index] || "1,1"; 
        const [startPage, endPage] = range.split(",").map(Number);

        // Previsualizara la primera y ultia pagina 
        if (typeRange === 0) {
          return (
            <div key={index}>
              <p>{file.name} - Primera Página</p>
              <button className="delete-button" onClick={() => handleDeleteFile(index)}>
                Eliminar
              </button>
              <div className="content_wrap_row">
                {/* Mostrar la primera página */}
                <div className="content_wrap_element">
                  <PdfViewer url={file.url} pageNum={startPage} />
                </div>

                <div className="arrow">
                  <span>&#8594;</span>
                </div>

                {/* Mostrar la última página */}
                <div className="content_wrap_element">
                  <PdfViewer url={file.url} pageNum={endPage} />
                </div>
              </div>
            </div>
          );
        }

        // Previsualizara todas las páginas individualmente
        if (typeRange === 1) {
          return (
            <div key={index}>
              <p>{file.name} - Todas las Páginas</p>
              <button className="delete-button" onClick={() => handleDeleteFile(index)}>
                Eliminar
              </button>
              <div className="content_wrap_row">
                {file.pages.map((pageNum) => (
                  <div key={pageNum} className="content_wrap_element">
                    <PdfViewer url={file.url} pageNum={pageNum} />
                    <span className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(pageNum)}
                      onChange={() => handleCheckboxChange(pageNum)}
                      className="checkbox-input"
                    />
                     {pageNum}
                  </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
      })}
      </div>

      </div>

      <button id="toggleSidebar" className="btn_toggle" onClick={toggleSidebar}>☰</button>
  
      {/* Sección de opciones de división */}
      <div className={`${styles.dividir} ${isSidebarOpen ? styles.active : ''}`}>
        <span className="main_h5_subtext">Dividir</span>
        <div className={styles.dividir_options}>
          <div className={styles.dividir_options_select}>
            <button className={optSelected === 0 ? styles.selected : ''} onClick={() => setOptSelected(0)}>
              Rango
            </button>
          </div>
        </div>
  
        {optSelected === 0 && (
          <RangeForm
            typeRange={typeRange}
            setTypeRange={setTypeRange}
            valueRangeStart={valueRangeStart}
            setValueRangeStart={setValueRangeStart}
            valueRangeEnd={valueRangeEnd}
            setValueRangeEnd={setValueRangeEnd}
            endPage={minEndPage}
          />
        )}

        {
          typeRange === 0 ? 
          (
            <button  className={`btn_main ${isButtonDisabled ? 'disabled' : ''}`} disabled={isButtonDisabled}   
              onClick={() => {
                if (!isButtonDisabled && pdfUrls.length > 0) {
                  const selectedPdfUrl = pdfUrls[0].url; 
                  const totalPages = pageRanges[0] ? Number(pageRanges[0].split(",")[1]) : 1;
            
                  if ((valueRangeStart < 1 || valueRangeEnd > totalPages || valueRangeStart > valueRangeEnd) ) {
                    alert(
                      `Rango de páginas inválido. Asegúrate de que el rango esté entre 1 y ${totalPages}.`
                    );
                    return;
                  }
                  console.log("START: " + valueRangeStart + " END: " + valueRangeEnd);
                  downloadPdfRange(selectedPdfUrl, Number(valueRangeStart),Number(valueRangeEnd));
                }
              }}
            >
              Dividir PDF
            </button>
          ) : 
          (
            <button
              className="btn_main"
              onClick={async () => {
                if (pdfUrls.length === 0) {
                  alert('No hay archivos cargados.');
                  return;
                }

                const file = pdfUrls[0]; 
                const pagesToDownload = selectedPages;

                if (pagesToDownload.length === 0) {
                  alert('No hay páginas seleccionadas.');
                  return;
                }

                await downloadSelectedPages(file.url, pagesToDownload);
              }}
            >
              Descargar Páginas Seleccionadas
            </button>
          )
        }
  

      </div>


    </div>
  );
}

export default DividirPdf;