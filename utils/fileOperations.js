const fs = require('fs');
exports.deleteFile = (file) => {
  try {
    fs.unlink(file, function (err) {
      if (err) return;
      // if no error, file has been deleted successfully
      console.log('File deleted!');
    });
  } catch (err) {}
};

exports.isFileValid = (file, type) => {
  const originalType = file.mimetype.split('/').pop();
  let validType = ['jpg', 'jpeg', 'png', 'pdf'];
  if (validType.indexOf(originalType) === -1) {
    return false;
  }
  return true;
};
