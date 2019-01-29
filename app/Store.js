const electron = require('electron');
const path = require('path');
const fs = require('fs');

class Store {
  constructor() {

    const userDataPath = (electron.app || electron.remote.app).getPath(
      'userData'
    );
    this.path = path.join(userDataPath, 'store.json');

    this.data = parseDataFile(this.path);
  }

  get(key, defaultValue) {
    defaultValue = typeof defaultValue === 'undefined' ? '' : defaultValue;
    return typeof this.data[key] === 'undefined' ? defaultValue : this.data[key];
  }

  set(key, val) {
    this.data[key] = val;

    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    return {};
  }
}

export default Store;
