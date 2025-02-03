import React, { useEffect, useRef,useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "/node_modules/pdfjs-dist/build/pdf.worker.mjs";

  const PdfViewer = ({ url, pageNum }) => {
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const renderTaskRef = useRef(null); 
  
    useEffect(() => {
      let isMounted = true;
  
      const loadPdf = async () => {
        try {
          if (!containerRef.current) return;
  
          containerRef.current.innerHTML = "";
  
          // Crea un nuevo canvas
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          const loadingTask = pdfjsLib.getDocument(url);
          const pdf = await loadingTask.promise;
  
          const page = await pdf.getPage(pageNum);
  
          const scale = 1.5;
          const viewport = page.getViewport({ scale });
  
          canvas.width = viewport.width;
          canvas.height = viewport.height;
  
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          renderTaskRef.current = page.render(renderContext); 
          await renderTaskRef.current.promise;
  
          if (isMounted && containerRef.current) {
            containerRef.current.appendChild(canvas);
            setIsLoading(false); 
          }
        } catch (error) {
          console.error("Error al cargar el PDF:", error);
          if (isMounted) {
            setIsLoading(false); 
          }
        }
      };
  
      loadPdf();
  
      // Limpieza al desmontar el componente
      return () => {
        isMounted = false;
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null; 
        }
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      };
    }, [url, pageNum]);
  
    return (
      <div>
        {isLoading && <p>Cargando PDF...</p>}
        <div ref={containerRef} /> 
      </div>
    );
  };
  
  export default PdfViewer;