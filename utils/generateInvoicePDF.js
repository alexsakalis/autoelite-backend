const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = async (html, invoiceNumber) => {
  const filePath = path.join(__dirname, `../tmp/invoice-${invoiceNumber}.pdf`);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return filePath;
};

module.exports = generateInvoicePDF;