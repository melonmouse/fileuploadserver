// Utilities that are shared between client and server.

export class UploadStatus {
  lastReceivedInUnit = NaN;
  
  getProgressString = (bytesReceived, bytesExpected) => {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const unitIndex = Math.floor(Math.log10(bytesExpected) / 3);
    const unitName = units[unitIndex];
    const unitSize = Math.pow(1000, unitIndex);
    const receivedInUnit = Math.round(bytesReceived / unitSize * 10) / 10;
    if (isNaN(this.lastReceivedInUnit) ||
      receivedInUnit > this.lastReceivedInUnit) {
      this.lastReceivedInUnit = receivedInUnit;
      const expectedInUnit = Math.round(bytesExpected / unitSize * 10) / 10;
      return `${receivedInUnit} / ${expectedInUnit} ${unitName}`;
    }
    return '';
  }

  printProgress = (bytesReceived, bytesExpected) => {
    const progressString = this.getProgressString(bytesReceived, bytesExpected);
    if (progressString.length > 0) {
      console.log(progressString);
    }
  }
}

