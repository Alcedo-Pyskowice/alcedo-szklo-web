import DataGrid, { Column, Editing, Popup, Form as DGForm } from "devextreme-react/data-grid";
import Form, { Item, RequiredRule } from "devextreme-react/form";
import TabPanel, { Item as TabPanelItem } from "devextreme-react/tab-panel";
import 'devextreme-react/text-area';
import validationEngine from 'devextreme/ui/validation_engine';
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../axios/instance";
import { dc_typeValues, deliveryValues } from "./orders";
import OrderPopupPopup from "./orderPopupPopup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "./orders.css";

const OrderPopupAttachments = React.lazy(() => import("./orderPopupAttachments"));
const OrderPopupParams = React.lazy(() => import("./orderPopupParams"));

// --- API Functions ---
const fetchPositions = async (DC_ID) => {
  const { data } = await axiosInstance.get(`/order/positions/${DC_ID}/1/1000000`);
  return data.data;
};

const savePosition = async ({ DC_ID, positionData }) => {
  console.log(positionData)
  const TP_ID = positionData.TP_ID || 0;
  const body = {
    data: {
      "TP_SHAPE": positionData.TP_SZPROS_KSZTALT?.includes(0) ? "1" : "0",
      "TP_MUNTINS": positionData.TP_SZPROS_KSZTALT?.includes(1) ? "T" : "N",
      "TP_ID": TP_ID,
      "TP_DCID": DC_ID,
      "DC_NO": DC_ID,
      "TP_POS": positionData.TP_POS,
      "TP_SYMBOL": positionData.TP_SYMBOL,
      "TP_NAME": positionData.TP_NAME,
      "TP_TYPE": positionData.TP_TYPE,
      "TP_QNT": positionData.TP_QNT,
      "TP_G_QNT": positionData.TP_G_QNT,
      "TP_R_QNT": positionData.TP_R_QNT,
      "TP_T_QNT": positionData.TP_T_QNT,
      "TP_W": positionData.TP_W,
      "TP_H": positionData.TP_H,
      "TP_IDENT": positionData.TP_IDENT,
      "TP_WEIGHT": positionData.TP_WEIGHT
    }
  };
  const { data } = await axiosInstance.put(`/order/position/save/${TP_ID}`, body);
  return data;
};

const removePosition = async (TP_ID) => {
  const { data } = await axiosInstance.post(`/order/position/delete/${TP_ID}`);
  return data;
};

// --- Component ---
export default function OrderPopup({ data, formData, setFormData, saveOrderMutation }) {
  const queryClient = useQueryClient();
  const dataGridRef = useRef(null);

  // --- State ---
  const [popupPositionFormData, setPopupPositionFormData] = useState({});
  const [titleData, setTitleData] = useState(null);

  // Derived State
  const DC_ID = formData?.DC_ID;
  const isNewOrder = !DC_ID;

  // --- TanStack Queries & Mutations ---
  const { data: positionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['positions', DC_ID],
    queryFn: () => fetchPositions(DC_ID),
    enabled: !!DC_ID, // Only fetch if DC_ID exists
    refetchOnWindowFocus: false
  });

  const savePositionMutation = useMutation({
    mutationFn: savePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions', DC_ID] });
    },
    onError: (error) => console.error("Error saving position:", error),
  });

  const removePositionMutation = useMutation({
    mutationFn: removePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions', DC_ID] });
    },
    onError: (error) => console.error("Error removing position:", error),
  });

  // Update title when formData changes (e.g., after a new order is saved)
  useEffect(() => {
    if (formData?.DC_ID) {
      setTitleData({
        DC_ID: formData.DC_ID,
        DC_STATE: formData.DC_STATE_TEXT,
        DC_RTIME: formData.DC_RTIME
      });
    }
  }, [formData]);


  // --- Event Handlers ---
  const handleFieldDataChanged = (e) => {
//    setFormData(prev => ({ ...prev, [e.dataField]: e.value }));
  };

  const handlePopupFieldDataChanged = (e) => {
 //   setPopupPositionFormData(prev => ({ ...prev, [e.dataField]: e.value }));
  };

  const handlePositionSaving = async (e) => {
    e.cancel = true; // Manual control
    const change = e.changes[0];
    console.log(change)

    if (change) {
      if (change.type === 'remove') {
        await removePositionMutation.mutateAsync(change.key);
        dataGridRef.current.instance().cancelEditData();
        return;
      }
    }

    let currentDcId = DC_ID;

    // If it's a new order, save the main order first to get an ID
    if (isNewOrder) {
      try {
        const newOrderData = await saveOrderMutation.mutateAsync(formData);
        currentDcId = newOrderData.DC_ID;
        // Update parent form state with the new order details
        setFormData(prev => ({ ...prev, ...newOrderData }));
      } catch (error) {
        console.error("Failed to save new order header:", error);
        return; // Stop if header saving fails
      }
    }

    // Now save the position with the correct (new or existing) DC_ID
    if (currentDcId) {
      await savePositionMutation.mutateAsync({
        DC_ID: currentDcId,
        positionData: popupPositionFormData
      });
      dataGridRef.current?.instance().cancelEditData();
    }
  };

  const onAddRowButtonClick = () => {
    // First, validate the main order form
    const result = validationEngine.validateGroup("myGroup");
    if (!result.isValid) {
      return; // Don't allow adding a position if the order header is invalid
    }
    dataGridRef.current.instance().addRow();
  };

  // --- Render ---
  const colorMap = { Otwarte: '#007BFF', Zamówione: '#FFC107', Akceptacja: '#FFC107', Produkcja: '#17A2B8', Gotowe: '#28A745', Wysłane: '#218838', Dostarczone: '#218838', Anulowane: '#DC3545', Usunięte: '#6C757D' };
  const dotColor = titleData ? colorMap[titleData.DC_STATE] : '#000';

  const makeDate = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hour}:${min}`;
  }

  return (
    <div>
      {titleData && (
        <span style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <h2>Zamówienie nr {titleData.DC_ID}</h2>
          <h2 className="state-span" style={{ '--dot-color': dotColor }}>Status: {titleData.DC_STATE}</h2>
          <div style={{}}>
            <span style={{ margin: 0, fontSize: '1em', fontWeight: 'bold' }}>Data rejestracji</span>
            <h3 style={{ margin: 0 }}>{makeDate(titleData.DC_RTIME)}</h3>
          </div>
        </span>
      )}

      <Form
        formData={formData}
        onFieldDataChanged={handleFieldDataChanged}
        validationGroup="myGroup"
        width={'100%'} labelMode="floating" colCount={4}
      >
        <Item dataField="DC_TYPE" editorType="dxSelectBox" editorOptions={{ dataSource: dc_typeValues, valueExpr: 'value', displayExpr: 'label' }} label={{ text: "Typ" }} />
        <Item dataField="DC_C_NUMBER" label={{ text: "Numer zamówienia kontrachenta" }} />
        <Item dataField="DC_DTIME" editorType="dxDateBox" editorOptions={{ displayFormat: "dd/MM/yyyy, HH:mm", type: "datetime" }} label={{ text: "Termin dostawy" }} />
        <Item dataField="DC_DELIVERY" editorType="dxSelectBox" editorOptions={{ dataSource: deliveryValues, valueExpr: 'value', displayExpr: 'label' }} label={{ text: "Sposób dostawy" }} />
        <Item dataField="DC_CONTACT" colSpan={4} label={{ text: "Kontakt" }}><RequiredRule message="To pole jest wymagane." /></Item>
        <Item dataField="DC_COMMENTS" editorType="dxTextArea" editorOptions={{ height: 100 }} colSpan={2} label={{ text: "Uwagi" }} />
        <Item dataField="DC_ADDRESS" editorType="dxTextArea" editorOptions={{ height: 100 }} colSpan={2} label={{ text: "Adres dostawy" }} />
      </Form>

      <TabPanel>
        <TabPanelItem title="Pozycje">
          <DataGrid
            ref={dataGridRef}
            dataSource={positionsData ? positionsData : []}
            keyExpr="TP_ID"
            onSaving={handlePositionSaving}
            onEditingStart={(e) => { setPopupPositionFormData(JSON.parse(JSON.stringify(e.data))); }}
            onInitNewRow={() => setPopupPositionFormData({})}
            onToolbarPreparing={(e) => e.toolbarOptions.items.find(i => i.name === 'addRowButton').options.onClick = onAddRowButtonClick}
            showBorders={true}
          >
            <Editing mode="popup" allowDeleting allowAdding allowUpdating>
              <Popup showTitle={true} showCloseButton={true} />
              <DGForm colCount={1}>
                <Item render={() => <OrderPopupPopup formData={popupPositionFormData} handleFieldDataChanged={handlePopupFieldDataChanged} />} />
              </DGForm>
            </Editing>
            <Column
              dataField="TP_ID"
              caption="Numer"
            />
            <Column
              dataField="TP_SYMBOL"
              caption="Symbol"
            />
            <Column
              dataField="TP_NAME"
              caption="Nazwa"
            />
            <Column
              dataField=""
              caption="Typ Produktu"
            />
            <Column
              dataField="TP_QNT"
              caption="Ilość"
            />
            <Column
              dataField="TP_STATE"
              caption="Stan"
            />
            <Column
              dataField=""
              caption="Gotowe"
            />
            <Column
              dataField=""
              caption="Rozliczone"
            />
            <Column
              dataField=""
              caption="Wys/Trans"
            />
            <Column
              dataField="TP_WIDTH"
              caption="Szerokość"
            />
            <Column
              dataField="TP_LENGTH"
              caption="Wysokość"
            />
            <Column
              dataField=""
              caption="Nr kształtu"
            />
            <Column
              dataField=""
              caption="Identyfikator"
            />
          </DataGrid>
        </TabPanelItem>
        <TabPanelItem title="Parametry" disabled={isNewOrder}>
          <React.Suspense fallback={<div>Loading...</div>}>
            {DC_ID && <OrderPopupParams DC_ID={DC_ID} />}
          </React.Suspense>
        </TabPanelItem>
        <TabPanelItem title="Załączniki" disabled={isNewOrder}>
          <React.Suspense fallback={<div>Loading...</div>}>
            {DC_ID && <OrderPopupAttachments DC_ID={DC_ID} />}
          </React.Suspense>
        </TabPanelItem>
      </TabPanel>
    </div>
  );
}
