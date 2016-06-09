import markdownPDF from 'markdown-pdf';
import DataURI from 'datauri';

export function makePDF(md) {
    return new Promise((resolve, reject) => {
        markdownPDF({
            remarkable: {
                preset: 'full'
            }
        }).from.string(md).to.buffer({
            //
        }, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                const data = new DataURI();
                data.format('.pdf', buffer);

                resolve(data.content);
            }
        });
    });
}
