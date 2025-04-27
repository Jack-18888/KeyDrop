const header = document.getElementById('header');
const fileInput = document.getElementById('file');
const fileName = document.getElementById('file-name');
const deleteBtn = document.getElementById('delete-btn'); 
const uploadBtn = document.getElementById('upload-btn'); 
const fileDisplay = document.querySelector('.files-display');
const shareBtn = document.getElementById('share-btn');

var fileList = []; // will hold File objects

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

  // Re-bind remove buttons
  const removeBtns = document.querySelectorAll('.remove-file-btn');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = parseInt(btn.dataset.index);
      fileList.splice(i, 1);
      renderFileList(); // 👈 recursive re-render
    });
  });

  shareBtn.style.display = 'block';
}

header.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    fileName.textContent = fileInput.files[0].name;
    deleteBtn.style.display = 'block';
    uploadBtn.style.display = 'block';
  }
});

deleteBtn.addEventListener('click', () => {
  fileInput.value = '';
  fileName.textContent = 'Browse File to upload!';
  deleteBtn.style.display = 'none';
  uploadBtn.style.display = 'none';
});

uploadBtn.addEventListener('click', () => {
  if (fileInput.files.length > 0) {
    fileList.push(fileInput.files[0]);
    fileInput.value = ''; // allow duplicate selection
    renderFileList(); // 👈 render on update
  }
});

// Share button: Zip and upload
shareBtn.addEventListener('click', async () => {
  if (fileList.length === 0) {
    alert('No files to upload!');
    return;
  }

  // Create a zip file
  const zip = new JSZip();
  fileList.forEach(file => {
    zip.file(file.name, file);
  });

  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Upload the zip to server
    const formData = new FormData();
    formData.append('file', zipBlob, 'files.zip');

    // const response = await fetch('https://your-server.com/upload', {
    //   method: 'POST',
    //   body: formData
    // });

    // if (response.ok) {
    //   alert('Files shared successfully!');
    //   // Reset everything
    //   fileList = [];
    //   fileName.textContent = 'Browse File to upload!';
    //   deleteBtn.style.display = 'none';
    //   shareBtn.style.display = 'none';
    // } else {
    //   alert('Failed to share files.');
    // }
  } catch (err) {
    console.error('Error while zipping/uploading:', err);
    alert('Error during upload.');
  }
});
