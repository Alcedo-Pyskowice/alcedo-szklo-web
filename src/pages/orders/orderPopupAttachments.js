import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../axios/instance"
import 'devextreme/dist/css/dx.common.css';
import '../../themes/generated/theme.base.dark.css';
import '../../themes/generated/theme.base.css';
import '../../themes/generated/theme.additional.dark.css';
import '../../themes/generated/theme.additional.css';
import "./orderPopupAttachments.css"
import { DataGrid, FileUploader } from "devextreme-react";
import { Editing } from "devextreme-react/data-grid";

export default function OrderPopupAttachments({ DC_ID }) {

  const [files, setFiles] = useState([])

  const fetchAttachments = async () => {
    try {
      if (DC_ID) {
        const response = await axiosInstance.get(`/order/files/${DC_ID}`);
        console.log(response)
        setFiles(response.data.data)
        return response;
      }
    } catch (error) {

    }
  }

  useEffect(() => {
    fetchAttachments()
  }, [])

  const uploadFile = useCallback(async (file, progressCallback) => {
    const formData = new FormData();
    formData.append('file', file);
    return await axiosInstance
      .post(`/order/files/upload/${DC_ID}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Content-Disposition": `form-data; name="test"; filename="${file.name}"`
        },
        onUploadProgress: e => {
          const percent = Math.round((e.loaded * 100) / (e.total || 1));
          progressCallback(percent);
        },
      })
      .then((response) => { fetchAttachments(); return response.data })
      .then(response => response.data)
      .catch(error => {
        // Optionally rethrow or return a rejected promise to signal failure
        return Promise.reject(error);
      });
  }, []);

  return (
    <>
      <div className="container" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <div id="dropzone" className="dropzone">
          <span style={{ opacity: 0.5 }}>Upuść pliki lub przeglądaj</span>
        </div>
        <FileUploader
          id="file-uploader"
          dialogTrigger={"#dropzone"}
          dropZone={"#dropzone"}
          uploadMode="instantly"
          visible={false}
          uploadFile={uploadFile}
        />
        <DataGrid
          style={{width: '80%'}}
          dataSource={files}
          showBorders={false}
          allowColumnResizing={true}
        >
          <Editing 
            allowDeleting
          />
        </DataGrid>
      </div>
    </>
  )

}
