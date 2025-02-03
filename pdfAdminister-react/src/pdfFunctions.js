// pdfFunctions.js
import { PDFDocument, range } from 'pdf-lib';

const getPageRange = async (file) => {
  try {
    const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    return numPages > 1 ? `1,${numPages}` : "1,1";
  } catch (error) {
    console.error("Error al cargar el PDF:", error);
    return "1,1";
  }
};

export const handleFileChange = async(event, setPdfUrls, setPdfFiles,setPageRanges) => {
  const files = event.target.files;
  const filesPdf = Array.from(event.target.files);

  const newFiles = await Promise.all(
    Array.from(files).map(async (file) => {
      const url = URL.createObjectURL(file);
      const name = file.name;

      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        
        const pages = Array.from({ length: numPages }, (_, i) => i + 1);

        return {
          url,
          name,
          pages,
        };
      } catch (error) {
        console.error("Error al cargar el PDF:", error);
        return {
          url,
          name,
          pages: [],
        };
      }
    })
  );
  
  let newPageRanges = [];
  if (setPageRanges) {
    for (const file of files) {
      try {
        const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const range = numPages > 1 ? `1,${numPages}` : "1,1";
        newPageRanges.push(range);
        console.log("Número de páginas:", numPages);
        console.log("Rango:", range);
      } catch (error) {
        console.error("Error al cargar el PDF:", error);
        newPageRanges.push("1,1");
      }
    }
  }

  // Actualizar los estados
  setPdfUrls((prevUrls) => [...prevUrls, ...newFiles]);
  setPdfFiles((prevFiles) => [...prevFiles, ...filesPdf]);
  if (setPageRanges) {
    setPageRanges((prevRanges) => [...prevRanges, ...newPageRanges]);
  }
  event.target.value = "";
};

export const handleFileChangeDrop =  async(files, setPdfUrls, setPdfFiles,setPageRanges) => {

  const pdfFiles = Array.from(files).filter((file) => file.type === "application/pdf");
  if (pdfFiles.length === 0) {
    alert("Solo se permiten archivos PDF.");
    return;
  }

  const newFiles = Array.from(files).map((file) => ({
    url: URL.createObjectURL(file),
    name: file.name,
  }));

  const newFilesPdf = Array.from(files);

  if(setPageRanges){
    const newPageRanges = await Promise.all(
      Array.from(files).map(async (file) => {
        return await getPageRange(file);
      })
    );
    setPageRanges((prevRanges) => [...prevRanges, ...newPageRanges]);
  }

  setPdfUrls((prevUrls) => [...prevUrls, ...newFiles]);
  setPdfFiles((prevFiles) => [...prevFiles, ...newFilesPdf]);
};

export const handleDrop = (event, setPdfUrls, setPdfFiles,setPageRanges) => {
  event.preventDefault();
  const files = event.dataTransfer ? event.dataTransfer.files : null;
  if (files) {
    handleFileChangeDrop(files, setPdfUrls, setPdfFiles,setPageRanges);
  }
};

export const handleDragOver = (event,setIsDragging) => {
  event.preventDefault();
  setIsDragging(true); 
};

export const mergePdfs = async (pdfFiles, setPdfUrls, setPdfFiles) => {
  if (pdfFiles.length < 1) {
    alert("Selecciona al menos dos archivos PDF para unir.");
    return;
  }

  const mergedPdf = await PDFDocument.create();

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  for (const file of pdfFiles) {
    if (!(file instanceof File)) {
      console.error("Archivo inválido:", file);
      continue;
    }
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "merged.pdf",
      types: [
        {
          description: "PDF Document",
          accept: { "application/pdf": [".pdf"] },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch (error) {
    console.error("Error al guardar el archivo:", error);
    alert("Error al guardar el archivo.");
  }
  setPdfUrls([]);
  setPdfFiles([]);
};


export const downloadPdfRange = async (pdfUrl, startPage, endPage) => {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;

    if (!pdf || typeof pdf.numPages !== "number") {
      throw new Error("El PDF no se cargó correctamente.");
    }

    const numericStartPage = Number(startPage);
    const numericEndPage = Number(endPage);

    const totalPages = pdf.numPages;
    if (
      !Number.isInteger(numericStartPage) ||
      !Number.isInteger(numericEndPage) ||
      numericStartPage < 1 ||
      numericEndPage > totalPages ||
      numericStartPage > numericEndPage
    ) {
      console.error(
        `Rango de páginas inválido. El PDF tiene ${totalPages} páginas.`
      );
      alert(
        `Rango de páginas inválido. Asegúrate de que el rango esté entre 1 y ${totalPages}.`
      );
      return;
    }

    const newPdf = await PDFDocument.create();
    for (let pageNumber = numericStartPage; pageNumber <= numericEndPage; pageNumber++) {
      try {
        const page = await pdf.getPage(pageNumber);
        console.log(`Página ${pageNumber} cargada correctamente.`); 

        const originalViewport = page.getViewport({ scale: 1 });
        const originalWidth = originalViewport.width;
        const originalHeight = originalViewport.height;

        const scale = 2.0; 
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        context.imageSmoothingEnabled = false;

        canvas.width = Math.floor(viewport.width); 
        canvas.height = Math.floor(viewport.height);

        await page.render({ canvasContext: context, viewport }).promise;

        const imageBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png", 1.0)
        );
        const imageBytes = await imageBlob.arrayBuffer();

        const embeddedImage = await newPdf.embedPng(imageBytes);
        const newPage = newPdf.addPage([originalWidth, originalHeight]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: originalWidth,
          height: originalHeight,
        });
      } catch (pageError) {
        console.error(`Error al cargar la página ${pageNumber}:`, pageError);
        alert(`Ocurrió un error al cargar la página ${pageNumber}.`);
        return;
      }
    }

    const pdfBytes = await newPdf.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pages_${numericStartPage}_to_${numericEndPage}.pdf`;
    a.click();
    URL.revokeObjectURL(url); 
  } catch (error) {
    console.error("Error al descargar el rango de páginas:", error);
    alert(
      "Ocurrió un error al descargar el rango de páginas. Consulta la consola para más detalles."
    );
  }
};





export const downloadSelectedPages = async (pdfUrl, selectedPages) => {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;

    if (!pdf || typeof pdf.numPages !== "number") {
      throw new Error("El PDF no se cargó correctamente.");
    }

    const totalPages = pdf.numPages;

    for (const pageNum of selectedPages) {
      if (!Number.isInteger(pageNum) || pageNum < 1 || pageNum > totalPages) {
        console.error(`Página inválida: ${pageNum}. El PDF tiene ${totalPages} páginas.`);
        alert(`Página inválida: ${pageNum}. Asegúrate de que las páginas seleccionadas estén entre 1 y ${totalPages}.`);
        return;
      }
    }

    const newPdf = await PDFDocument.create();

    for (const pageNumber of selectedPages) {
      try {
        const page = await pdf.getPage(pageNumber);
        console.log(`Página ${pageNumber} cargada correctamente.`);

        const originalViewport = page.getViewport({ scale: 1 });
        const originalWidth = originalViewport.width;
        const originalHeight = originalViewport.height;
        const scale = 2.0;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        await page.render({ canvasContext: context, viewport }).promise;

        const imageBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png", 1.0)
        );
        const imageBytes = await imageBlob.arrayBuffer();
        const embeddedImage = await newPdf.embedPng(imageBytes);

        const newPage = newPdf.addPage([originalWidth, originalHeight]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: originalWidth,
          height: originalHeight,
        });
      } catch (pageError) {
        console.error(`Error al cargar la página ${pageNumber}:`, pageError);
        alert(`Ocurrió un error al cargar la página ${pageNumber}.`);
        return;
      }
    }

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "selected-pages.pdf",
          types: [
            {
              description: "PDF Files",
              accept: { "application/pdf": [".pdf"] },
            },
          ],
        });

        const writableStream = await handle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("El usuario canceló la operación de guardado.");
        } else {
          console.error("Error al guardar el archivo:", error);
        }
      }
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "selected-pages.pdf";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  } catch (error) {
    console.error("Error al descargar las páginas seleccionadas:", error);
    alert(
      "Ocurrió un error al descargar las páginas seleccionadas. Consulta la consola para más detalles."
    );
  }
};