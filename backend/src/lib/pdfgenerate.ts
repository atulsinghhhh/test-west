import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const PDFGenerate = async (
    content: string,
    title: string
): Promise<{ fileName: string; filePath: string }> => {
    return new Promise((resolve, reject) => {
        try {
            const fileName = `${title.replace(/ /g, "_")}_${Date.now()}.pdf`;

            const publicDir = path.join(process.cwd(), "public");

            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }

            const filePath = path.join(publicDir, fileName);

            const doc = new PDFDocument({ margin: 40 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            doc.fontSize(20).text(title, { align: "center" });
            doc.moveDown();
            doc.fontSize(12).text(content, { align: "left" });

            doc.end();

            stream.on("finish", () => resolve({ fileName, filePath }));
            stream.on("error", reject);

        } catch (error) {
            reject(error);
        }
    });
};
