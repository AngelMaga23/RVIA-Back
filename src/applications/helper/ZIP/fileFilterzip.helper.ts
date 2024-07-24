

export const fileFilterZip = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    if ( !file ) return callback( new Error('File is empty'), false );

    const fileExptension = file.mimetype.split('/')[1];
    //TODO: Revisar aqui
    const validExtensions = ['zip','x-zip-compressed'];

    if (  validExtensions.includes( fileExptension ) ) {
        return callback( null, true )
    }

    callback(null, false );

}
