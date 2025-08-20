import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const pageTitle = (title) => {
  return (document.title = title + ' Invoice');
};

export const currentDate = () => {
  const day = new Date().getDate();
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const date = `${day}-${month}-${year}`;
  return date;
};

export const currentDate2 = () => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const day = new Date().getDate();
  const monthIndex = new Date().getMonth();
  const monthName = monthNames[monthIndex];
  const year = new Date().getFullYear();
  const date = `${day}-${monthName}-${year}`;
  return date;
};

export const currentDate3 = () => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const day = new Date().getDate();
  const monthIndex = new Date().getMonth();
  const monthName = monthNames[monthIndex];
  const year = new Date().getFullYear();
  const date = `${day} ${monthName} ${year}`;
  return date;
};

export const currentDate4 = () => {
  const day = new Date().getDate();
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const date = `${day}/${month}/${year}`;
  return date;
};

export const currentDate5 = () => {
  const day = new Date().getDate();
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const date = `${day}.${month}.${year}`;
  return date;
};

export const handleDownload = async (page) => {
  const content = page.current;

  // Step 1: Capture invoice with higher scale
  const canvas = await html2canvas(content, {
    scale: 4,
    useCORS: true
  });

  const imgData = canvas.toDataURL('image/jpeg', 1);

  // Step 3: Setup jsPDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save('invoice.pdf');
};
