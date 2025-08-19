import DataGrid, { Column, Editing } from "devextreme-react/data-grid";
import FileUploader from "devextreme-react/file-uploader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axios/instance";
import "./orderPopupAttachments.css";

// --- API Functions ---
const fetchAttachments = async (DC_ID) => {
  const { data } = await axiosInstance.get(`/order/files/${DC_ID}`);
  return data.data;
};

const uploadAttachment = async ({ DC_ID, file, progressCallback }) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axiosInstance.post(`/order/files/upload/${DC_ID}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / (e.total || 1));
      progressCallback(percent);
    },
  });
  return data;
};

const deleteAttachment = async (DF_ID) => {
  // Assuming an endpoint exists for deletion, e.g., /order/files/delete/{id}
  const { data } = await axiosInstance.post(`/order/file/delete/${DF_ID}`);
  return data;
}

// --- Component ---
export default function OrderPopupAttachments({ DC_ID }) {
  const queryClient = useQueryClient();

  // --- TanStack Query & Mutations ---
  const { data: files, isLoading } = useQuery({
    queryKey: ['attachments', DC_ID],
    queryFn: () => fetchAttachments(DC_ID),
    enabled: !!DC_ID,
    refetchOnWindowFocus: false
  });

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', DC_ID] });
    },
    onError: (error) => console.error("Upload failed:", error)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', DC_ID] });
    },
    onError: (error) => console.error("Delete failed:", error)
  });

  // --- Event Handlers ---
  const handleUploadFile = (file, progressCallback) => {
    // The FileUploader expects a Promise. mutateAsync returns one.
    return uploadMutation.mutateAsync({ DC_ID, file, progressCallback });
  };

  const handleRowRemoving = async (e) => {
    e.cancel = true; // Manual control
    try {
      await deleteMutation.mutateAsync(e.data.DF_ID);
    } catch (error) {
      console.error("Could not delete file", error);
    }
  }

  if (isLoading) return <div>Ładowanie załączników...</div>

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <div id="dropzone-external" className="flex-box">
        <span style={{ opacity: 0.5 }}>Upuść pliki lub przeglądaj</span>
      </div>
      <FileUploader
        dialogTrigger={"#dropzone-external"}
        dropZone={"#dropzone-external"}
        uploadMode="instantly"
        visible={false}
        uploadFile={handleUploadFile}
      />
      <DataGrid
        style={{ width: '80%' }}
        dataSource={files}
        keyExpr="DF_ID"
        showBorders={false}
        onRowRemoving={handleRowRemoving}
      >
        <Editing mode="row" allowDeleting={true} />
        <Column dataField="DF_NAME" caption="Nazwa pliku" />
        <Column dataField="DF_SIZE" caption="Rozmiar" />
        <Column dataField="DF_RTIME" caption="Data dodania" dataType="datetime" />
      </DataGrid>
    </div>
  );
}
