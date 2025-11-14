// PDF.js worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let currentFile = null;
let extractedData = [];

// Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const extractBtn = document.getElementById('extractBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const statusMessage = document.getElementById('statusMessage');
const results = document.getElementById('results');
const errorMessage = document.getElementById('errorMessage');
const totalRows = document.getElementById('totalRows');
const totalPages = document.getElementById('totalPages');
const boolCount = document.getElementById('boolCount');
const tableBody = document.getElementById('tableBody');
const downloadExcel = document.getElementById('downloadExcel');
const downloadCsv = document.getElementById('downloadCsv');

// Upload area click
uploadArea.addEventListener('click', () => fileInput.click());

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Handle file selection
function handleFile(file) {
    if (!file.type.includes('pdf')) {
        showError('Per favore seleziona un file PDF valido');
        return;
    }

    if (file.size > 50 * 1024 * 1024) {
        showError('Il file è troppo grande. Massimo 50MB');
        return;
    }

    currentFile = file;
    
    // Show file info
    fileName.textContent = `📄 ${file.name}`;
    fileSize.textContent = `Dimensione: ${formatFileSize(file.size)}`;
    fileInfo.classList.add('show');
    
    // Enable extract button
    extractBtn.disabled = false;
    
    // Hide previous results
    results.classList.remove('show');
    errorMessage.classList.remove('show');
}

// Extract button click
extractBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    
    extractBtn.disabled = true;
    progressContainer.classList.add('show');
    results.classList.remove('show');
    errorMessage.classList.remove('show');
    
    try {
        await extractPdfData(currentFile);
    } catch (error) {
        showError(`Errore durante l'estrazione: ${error.message}`);
        console.error(error);
    } finally {
        extractBtn.disabled = false;
    }
});

// Extract data from PDF
async function extractPdfData(file) {
    updateProgress(10, 'Caricamento PDF...');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    extractedData = [];
    const totalPagesCount = pdf.numPages;
    
    updateProgress(20, `Elaborazione ${totalPagesCount} pagine...`);
    
    for (let pageNum = 1; pageNum <= totalPagesCount; pageNum++) {
        updateProgress(20 + (pageNum / totalPagesCount) * 60, 
            `Elaborazione pagina ${pageNum}/${totalPagesCount}...`);
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text
        const text = textContent.items.map(item => item.str).join(' ');
        
        // Parse data from text
        parsePageData(text);
    }
    
    updateProgress(90, 'Finalizzazione dati...');
    
    // Calculate statistics
    const boolVars = extractedData.filter(row => row.Type === 'BOOL').length;
    
    // Update UI
    totalRows.textContent = extractedData.length;
    totalPages.textContent = totalPagesCount;
    boolCount.textContent = boolVars;
    
    // Update preview table
    updatePreviewTable();
    
    updateProgress(100, 'Completato!');
    
    setTimeout(() => {
        progressContainer.classList.remove('show');
        results.classList.add('show');
    }, 500);
}

// Parse data from page text
function parsePageData(text) {
    // Split into lines
    const lines = text.split('\n');
    
    let inDataSection = false;
    
    for (let line of lines) {
        line = line.trim();
        
        // Check if we're in data section
        if (line.includes('Address') && line.includes('Name') && line.includes('Type')) {
            inDataSection = true;
            continue;
        }
        
        if (!inDataSection || !line) continue;
        
        // Skip headers
        if (line.includes('Address') || line.includes('SI MATI C') || line.includes('Pagi na')) {
            continue;
        }
        
        // Parse data line
        // Pattern: +Address Name Type InitialValue Comment
        const match = line.match(/^(\+[\d.]+)\s+(\S+)\s+(BOOL|BYTE|WORD|DWORD|REAL|INT|DINT|STRING|ARRAY\[.*?\]|STRUCT|END_STRUCT)\s+(TRUE|FALSE|[\d.]+|\S+)\s+(.*)$/);
        
        if (match) {
            extractedData.push({
                Address: match[1],
                Name: match[2],
                Type: match[3],
                InitialValue: match[4],
                Comment: match[5].trim()
            });
        }
        // Alternative pattern for special rows
        else if (line.match(/^(\*[\d.]+)\s+(\S+)/)) {
            const altMatch = line.match(/^(\*[\d.]+)\s+(\S+)/);
            extractedData.push({
                Address: altMatch[1],
                Name: '',
                Type: altMatch[2],
                InitialValue: '',
                Comment: ''
            });
        }
    }
}

// Update preview table
function updatePreviewTable() {
    tableBody.innerHTML = '';
    
    const preview = extractedData.slice(0, 10);
    
    preview.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.Address}</td>
            <td>${row.Name}</td>
            <td>${row.Type}</td>
            <td>${row.InitialValue}</td>
            <td>${row.Comment}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Download Excel
downloadExcel.addEventListener('click', () => {
    const ws = XLSX.utils.json_to_sheet(extractedData);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 12 }, // Address
        { wch: 30 }, // Name
        { wch: 15 }, // Type
        { wch: 15 }, // InitialValue
        { wch: 60 }  // Comment
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DB_Data');
    
    const fileName = currentFile.name.replace('.pdf', '_extracted.xlsx');
    XLSX.writeFile(wb, fileName);
});

// Download CSV
downloadCsv.addEventListener('click', () => {
    const headers = ['Address', 'Name', 'Type', 'InitialValue', 'Comment'];
    const csvContent = [
        headers.join(';'),
        ...extractedData.map(row => 
            headers.map(h => `"${row[h] || ''}"`).join(';')
        )
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', currentFile.name.replace('.pdf', '_extracted.csv'));
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Utility functions
function updateProgress(percent, message) {
    progressFill.style.width = `${percent}%`;
    progressFill.textContent = `${Math.round(percent)}%`;
    statusMessage.textContent = message;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    progressContainer.classList.remove('show');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
