document.addEventListener('DOMContentLoaded', function () {
  const downloadButton = document.querySelector('button');
  const keyInput = document.getElementById('keyInput');
  const messageDisplay = document.getElementById('messageDisplay');

  downloadButton.addEventListener('click', function () {
    const key = keyInput.value.trim();
  
    if (!key) {
      messageDisplay.textContent = 'Please enter a key.';
      messageDisplay.style.color = 'red';
      return;
    }
  
    // Show loading spinner
    Swal.fire({
      title: 'Preparing your download...',
      text: 'Fetching your files. Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    fetch(`/api/download?key=${encodeURIComponent(key)}`)
      .then(response => {
        Swal.close(); // close loading spinner
  
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Error downloading file.');
          });
        }
        return response.blob();
      })
      .then(blob => {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'downloaded_file';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
  
        messageDisplay.textContent = 'Download started!';
        messageDisplay.style.color = 'green';
      })
      .catch(error => {
        Swal.close();
        messageDisplay.textContent = error.message;
        messageDisplay.style.color = 'red';
      });
  });
  
});