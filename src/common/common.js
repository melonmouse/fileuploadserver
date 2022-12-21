// Utilities that are shared between client and server.

export class UploadStatus {
  lastReceivedInUnit = NaN;
  lastProgressString = '';
  
  getProgressString = (bytesReceived, bytesExpected) => {
    console.assert(typeof bytesReceived == 'number');
    console.assert(typeof bytesExpected == 'number');
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const unitIndex = Math.floor(Math.log10(bytesExpected) / 3);
    const unitName = units[unitIndex];
    const unitSize = Math.pow(1000, unitIndex);
    const receivedInUnit = Math.round(bytesReceived / unitSize * 10) / 10;
    if (isNaN(this.lastReceivedInUnit) ||
      receivedInUnit > this.lastReceivedInUnit) {
      this.lastReceivedInUnit = receivedInUnit;
      const expectedInUnit = Math.round(bytesExpected / unitSize * 10) / 10;
      this.lastProgressString =
        `${receivedInUnit.toFixed(1)} / ${expectedInUnit.toFixed(1)} ${unitName}`;
    }
    return this.lastProgressString;
  }

  printProgressIfChanged = (bytesReceived, bytesExpected) => {
    const oldProgressString = this.lastProgressString;
    const progressString = this.getProgressString(bytesReceived, bytesExpected);
    if (oldProgressString != progressString) {
      console.log(progressString);
    }
  }
}

