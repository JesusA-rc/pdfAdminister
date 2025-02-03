import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "/node_modules/pdfjs-dist/build/pdf.worker.mjs";

const useNumPages = (url) => {
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    const fetchNumPages = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        setNumPages(pdf.numPages);
      } catch (error) {
        console.error("Error al obtener el número de páginas:", error);
      }
    };

    if (url) {
      fetchNumPages();
    }
  }, [url]);

  return numPages;
};

export default useNumPages;