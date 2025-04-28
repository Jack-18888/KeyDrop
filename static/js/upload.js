const header = document.getElementById('header');
const fileInput = document.getElementById('file');
const fileName = document.getElementById('file-name');
const deleteBtn = document.getElementById('delete-btn'); 
const uploadBtn = document.getElementById('upload-btn'); 
const fileDisplay = document.querySelector('.files-display');
const shareBtn = document.getElementById('share-btn');

var fileList = [];

function renderFileList() {
  if (fileList.length === 0) {
    fileName.textContent = 'Browse File to upload!';
    fileDisplay.innerHTML = '';
    shareBtn.style.display = 'none';
    return;
  }

  fileName.textContent = `${fileList.length} file${fileList.length > 1 ? 's' : ''} ready.`;

  fileDisplay.innerHTML = fileList.map((file, index) => `
    <div class="file-name-wrapper">
      <p class="file-name">${file.name}</p>
      <button class="remove-file-btn" data-index="${index}">🗑️</button>
    </div>
  `).join("");

  const removeBtns = document.querySelectorAll('.remove-file-btn');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.index);
      fileList.splice(i, 1);
      renderFileList();
    });
  });

  shareBtn.style.display = 'block';
}

function resetFiles() {
  fileList = [];
  fileName.textContent = 'Browse File to upload!';
  fileInput.value = '';
  deleteBtn.style.display = 'none';
  shareBtn.style.display = 'none';
}

function successAlert(downloadKey) {
  Swal.fire({
    title: 'Files Shared Successfully!',
    html: `
      <p>Your download key is:</p>
      <input id="download-key-input" class="swal2-input" value="${downloadKey}" readonly>
      <button id="copy-key-btn" class="swal2-confirm swal2-styled" style="margin-top:10px;">Copy Key</button>
    `,
    showConfirmButton: false,
    didOpen: () => {
      const copyBtn = document.getElementById('copy-key-btn');
      const input = document.getElementById('download-key-input');

      copyBtn.addEventListener('click', () => {
        input.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        copyBtn.disabled = true;
        setTimeout(() => {
          copyBtn.textContent = 'Copy Key';
          copyBtn.disabled = false;
        }, 1000);
      });
    }
  });
}

function failureAlert() {
  Swal.fire({
    title: 'Upload Failed',
    text: 'There was a problem sharing your files. Please try again.',
    icon: 'error',
    confirmButtonText: 'OK',
  });
}

function noFilesAlert() {
  Swal.fire({
    title: 'No Files Selected',
    text: 'Please choose at least one file before sharing.',
    icon: 'warning',
    confirmButtonText: 'OK',
  });
}

header.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    for (const file of fileInput.files) {
      fileList.push(file);
    }
    fileInput.value = '';  // clear so you can re-upload same file
    renderFileList();
  }
});

deleteBtn.addEventListener('click', () => {
  resetFiles();
});

shareBtn.addEventListener('click', async () => {
  if (fileList.length === 0) {
    noFilesAlert();
    return;
  }

  const formData = new FormData();
  fileList.forEach(file => {
    formData.append('files', file);
  });

  // Show loading spinner
  Swal.fire({
    title: 'Uploading...',
    text: 'Please wait while we upload your files.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    Swal.close(); // close loading spinner

    if (response.ok) {
      const data = await response.json();
      const downloadKey = data['key'];
      successAlert(downloadKey);
      resetFiles();
    } else {
      failureAlert();
    }
  } catch (err) {
    console.error('Error while uploading:', err);
    failureAlert();
    Swal.close();
  }
});
