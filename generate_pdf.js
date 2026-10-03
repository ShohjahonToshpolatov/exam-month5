const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.join(__dirname, 'pdf_presentation.html');
const pdfPath = path.join(__dirname, 'Topildi_Platformasi_Taqdimot.pdf');

console.log('Generating PDF via Chrome Headless...');
const cmd = `"${chromePath}" --headless=new --disable-gpu --no-sandbox --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log('SUCCESS! PDF generated:', pdfPath);
    console.log('File Size:', Math.round(stats.size / 1024), 'KB');
  } else {
    console.error('PDF file not created.');
  }
} catch (err) {
  console.error('Execution error:', err);
}
