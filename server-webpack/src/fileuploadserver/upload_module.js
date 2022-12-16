console.log('LOADING SCRIPT');
function myUpload(formElement) {
    var xhr = new XMLHttpRequest();
    xhr.open(formElement.method, formElement.action);// True for async which is default
    xhr.upload.onprogress = reportProgress;
    xhr.upload.loadstart = () => setUploadStatus('Upload started');
    xhr.upload.loadend =  () => setUploadStatus('Upload done');
    xhr.upload.error = () => setUploadStatus('Upload error');
    xhr.upload.abort = () => setUploadStatus('Upload abort');
    xhr.upload.timeout = () => setUploadStatus('Upload timeout');

    xhr.onreadystatechange = function() {
        // NOTE: may be redundant?
        if (xhr.readyState === XMLHttpRequest.DONE) {
            // The other values are: OPENED, HEADERS_RECEIVED, LOADING
            if (xhr.status === 200) {
                console.log('Upload complete');
                document.getElementById('uploadStatus').innerHTML = 'Upload complete';
            } else {
                console.log('Upload error');
                document.getElementById('uploadStatus').innerHTML = 'Upload error';
            }
        } else {
            console.log('readyState:'  + xhr.readyState);
            console.log('Status:'  + xhr.status);
        }
    };

    xhr.send(new FormData(formElement));
    event.preventDefault();
}

function reportProgress(e) {
    const message = e.lengthComputable ? `${(e.loaded / e.total) * 100}% uploaded` : 'Upload started';
    console.log(message);
    setUploadStatus(message);
}

function setUploadStatus(s) {
    document.getElementById('uploadStatus').innerText = s;
}
