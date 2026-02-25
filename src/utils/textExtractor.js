const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');

const extractTextFromPDF = async (filePath) => {
    const {buffer,originalname} = filePath
    const data = await pdfParse(buffer);
    return data.text;
}

const extractTextFromDocx = async (filePath) => {
    const {buffer,originalname} = filePath
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

const extractText = async (filePath) => {

    if(!filePath || !filePath.buffer || !filePath.originalname){
        throw new Error('Invalid file input for text extraction');
    }

    const {originalname} = filePath
    const ext = path.extname(originalname).toLowerCase();
    let text = '';
    if (ext === '.pdf') {
        text = await extractTextFromPDF(filePath);
    } else if (ext === '.docx') {
        text = await extractTextFromDocx(filePath);
    }
    return text;
}

module.exports = extractText;