document.addEventListener('DOMContentLoaded', function () {
  const downloadButton = document.querySelector('button');
  const keyInput = document.getElementById('keyInput');
  const messageDisplay = document.getElementById('messageDisplay');

  downloadButton.addEventListener('click', async function () {
    const key = keyInput.value.trim();
  
    if (!key) {
      messageDisplay.textContent = 'Please enter a key.';
      messageDisplay.style.color = 'red';
      return;
    }
  
    // Show loading screen
    Swal.fire({
      title: 'Preparing your download...',
      html: `
        <div id="progress-container" style="width:100%;background:#eee;border-radius:8px;margin-top:10px;">
          <div id="progress-bar" style="height:20px;width:100%;background:repeating-linear-gradient(45deg, royalblue, royalblue 10px, #e0e0e0 10px, #e0e0e0 20px); border-radius:8px; animation: loading 1s linear infinite;"></div>
        </div>
        <p style="margin-top:10px;">Downloading...</p>
        <style>
          @keyframes loading {
            0% { background-position: 0 0; }
            100% { background-position: 40px 0; }
          }
        </style>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      scrollbarPadding: false,
      backdrop: false,
      showConfirmButton: false,
    });
  
    try {
      const response = await fetch(`/api/download?key=${encodeURIComponent(key)}`);
      
      if (!response.ok) {
        Swal.close();
        const data = await response.json();
        throw new Error(data.message || 'Error downloading file.');
      }
  
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'downloaded_file';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
  
      // 🟰 VERY IMPORTANT: close the loading popup immediately after starting download
      Swal.close(); 
      Swal.fire({
        icon: 'success',
        title: 'Download started!',
        showConfirmButton: false,
        timer: 1500,
        allowOutsideClick: false,
        allowEscapeKey: false,
        scrollbarPadding: false,
        backdrop: false,
      });
  
      messageDisplay.textContent = 'Download started!';
      messageDisplay.style.color = 'green';
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        scrollbarPadding: false,
        backdrop: false,
        showConfirmButton: false,
      });
      messageDisplay.textContent = error.message;
      messageDisplay.style.color = 'red';
    }
  });  
});