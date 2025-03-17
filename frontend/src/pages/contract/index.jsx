// pages/index.js
import { FilePdfOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import mammoth from "mammoth";
import pdfmake from "pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useState } from "react";
import { storage } from "../../../firebase.js"; // Import your Firebase storage instance // Thay đổi đường dẫn tùy thuộc vào cấu trúc dự án của bạn

export default function Home() {
  const [file, setFile] = useState(null);

  const beforeUpload = (file) => {
    setFile(file);
    return false;
  };

  const handleUpload = async () => {
    if (!file) {
      message.error("Vui lòng chọn tệp DOCX trước khi tải lên.");
      return;
    }
    var result;
    // const docxContent = await readFile(file);
    let reader = new FileReader();
    reader.onloadend = function (event) {
      let arrayBuffer = reader.result;

      mammoth
        .convertToHtml({ arrayBuffer: arrayBuffer })
        .then(function (resultObject) {
          const pdfDoc = pdfmake.createPdf(
            { content: [{ text: resultObject.value }] },
            null,
            null,
            pdfFonts.pdfMake.vfs
          );

          // Chuyển đổi PDF thành mảng bytes để lưu trữ hoặc hiển thị
          pdfDoc.getBlob(async (blob) => {
            // Lưu tệp PDF vào Firebase Storage
            const pdfPath = await uploadPdfToFirebase(blob);

            // Lưu đường dẫn của tệp PDF vào MongoDB
            savePdfPathToMongoDB(pdfPath);

            message.success("Tải lên và chuyển đổi thành công.");
          });
          console.log(resultObject.value);
        });
      console.timeEnd();
    };
    reader.readAsArrayBuffer(file);

    // Quét tệp DOCX và nhận kết quả dưới dạng HTML
    // const result = await mammoth.convertToHtml({ arrayBuffer: docxContent });
    // console.log(result.value[11]);
    // Tạo một đối tượng PDF từ HTML
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadPdfToFirebase = async (pdfBlob) => {
    const pdfFileRef = ref(
      storage,
      `pdfs/${file.name.replace(/\s+/g, "_").toLowerCase()}.pdf`
    );

    const uploadTask = uploadBytesResumable(pdfFileRef, pdfBlob);

    uploadTask.on("state_changed", (snapshot) => {
      // Handle upload progress, if needed
    });

    uploadTask.then(async (snapshot) => {
      // Handle successful upload, e.g., save download URL to the database
      const downloadURL = await getDownloadURL(pdfFileRef);
      console.log(downloadURL);
    });
  };
  const savePdfPathToMongoDB = (pdfPath) => {
    // Gọi API hoặc thực hiện các bước lưu trữ đường dẫn vào MongoDB ở đây
    console.log("Lưu đường dẫn vào MongoDB:", pdfPath);
  };

  return (
    <div>
      <Upload
        maxCount={1}
        listType="text"
        showUploadList={true}
        beforeUpload={beforeUpload}
      >
        <Button icon={<UploadOutlined />}>Chọn tệp DOCX</Button>
      </Upload>
      <Button type="primary" icon={<FilePdfOutlined />} onClick={handleUpload}>
        Tải lên và Chuyển đổi thành PDF
      </Button>
    </div>
  );
}
