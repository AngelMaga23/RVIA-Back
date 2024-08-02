

export const fileFilterZip = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    if (!file) return callback(new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['zip', 'x-zip-compressed', 'pdf', 'x-7z-compressed'];
   
    if (validExtensions.includes(fileExtension)) {
        return callback(null, true);
    }

    callback(null, false);

}
