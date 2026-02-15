// Function to generate PDF from the preview element
// This relies on html2pdf.js being loaded in index.html

declare const html2pdf: any;

export const generatePdf = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Preview element not found');
  }

  // Options for html2pdf
  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      logging: false,
      // Increase window width to ensure responsive layouts render as desktop
      windowWidth: 1024 
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };

  try {
    // ⏱️ WAIT for KaTeX and Images to Render
    // We add a small delay to ensure all DOM updates from React and KaTeX are finalized.
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error('PDF Generation Failed:', error);
    throw error;
  }
};