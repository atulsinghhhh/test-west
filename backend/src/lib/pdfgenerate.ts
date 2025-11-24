import PDFDocument from 'pdfkit';
import fs from 'fs'
import path  from 'path'

export const PDFGenerate = async(content: string,title: string): Promise<{ fileName: string; filePath: string }> =>{
    return new Promise((resolve,reject)=>{
        try {
            const fileName = `${title.replace(/ /g, "_")}_${Date.now()}.pdf`;
            const filePath = path.join(__dirname, "../public", fileName);

            if (!fs.existsSync(path.join(__dirname, "../public"))) {
                fs.mkdirSync(path.join(__dirname, "../public"));
            }

            const doc = new PDFDocument({ margin: 40 });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream); // tells pdfkit to send PDF data into the file

            doc.fontSize(20).text(title, { align: "center" });
            doc.moveDown();

            doc.fontSize(12).text(content, { align: "left" });

            doc.end();

            stream.on("finish", () => resolve({ fileName, filePath }));
            stream.on("error", reject);

        } catch (error) {
            reject(error)
        }
    })
}