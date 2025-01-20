"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilePathMultiple = void 0;
const getFilePathMultiple = (files, fieldname, folderName) => {
    let value;
    Object.entries(files).forEach(([key, _value]) => {
        if (fieldname === key) {
            value = _value.map((v) => `/${folderName}s/${v.filename}`);
        }
    });
    return value;
};
exports.getFilePathMultiple = getFilePathMultiple;
const getFilePath = (files, folderName) => {
    if (files && files.image[0].fieldname in files && files.image[0]) {
        return `/${folderName}/${files.image[0].filename}`;
    }
    return null;
};
exports.default = getFilePath;
