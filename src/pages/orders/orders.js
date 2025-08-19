import DataGrid from "devextreme-react/data-grid";
import ButtonGroup from "devextreme-react/button-group";
import Toast from "devextreme-react/toast";
import { Column, Editing, Form, Pager, Paging, Popup, Toolbar, Item, StateStoring, Lookup, ColumnChooser, Position, FilterRow, FilterPanel, FilterBuilderPopup, HeaderFilter, MasterDetail } from "devextreme-react/data-grid";
import validationEngine from 'devextreme/ui/validation_engine';
import { useRef, useState } from "react";
import axiosInstance from "../../axios/instance";
import DataGridDetail from "./dataGridDetail";
import OrderPopup from "./orderPopup";
import "./orders.css";
import "./orders.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchOrders = async (stateButtonSelected, typeButtonSelected) => {
  const params = {
    page: 1,
    limit: 150, // Or implement pagination
    DC_STATE: stateButtonSelected.join(','),
    DC_TYPE: typeButtonSelected.join(',')
  };
  const { data } = await axiosInstance.get("/orders/1/15", { params });
  return data.data;
};

const saveOrder = async (orderData) => {
  const DC_ID = orderData.DC_ID || 0;
  const body = {
    data: {
      ...orderData,
      DC_DTIME: new Date(orderData.DC_DTIME)
    }
  };
  const { data } = await axiosInstance.put(`/order/save?DC_ID=${DC_ID}`, body);
  return data.data[0];
};

const removeOrder = async (DC_ID) => {
  const { data } = await axiosInstance.post(`/order/delete/${DC_ID}`);
  return data;
};


export const deliveryValues = [
  { value: 100, label: "Stojaki/Transport" },
  { value: 200, label: "Stojaki/Odbiór własny" },
  { value: 250, label: "Luzem/Odbiór własny" }
];
export const dc_typeValues = [
  { value: 'S', label: 'Standard' },
  { value: 'R', label: 'Reklamacja' },
  { value: 'W', label: 'Wewnętrzne' },
  { value: 'Z', label: 'Zewnętrzne' }
];

// --- Component ---
export default function Orders() {
  const queryClient = useQueryClient();
  const dataGridRef = useRef(null);

  // --- State ---
  const [stateButtonSelected, setStateButtonSelected] = useState([]);
  const [typeButtonSelected, setTypeButtonSelected] = useState([]);
  const [popupFormData, setPopupFormData] = useState({});
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState({ isVisible: false, type: "error", message: '' });

  const stateValues = [{ text: 'O', state: 'O' }, { text: 'Z', state: 'Z' }, { text: 'A', state: 'A' }, { text: 'P', state: 'P' }, { text: 'G', state: 'G' }, { text: 'W', state: 'W' }, { text: 'D', state: 'D' }, { text: 'X', state: 'X' }];
  const typeValues = [{ text: 'S', type: 'S' }, { text: 'V', type: 'V' }, { text: 'R', type: 'R' }];

  // --- TanStack Queries & Mutations ---

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', stateButtonSelected, typeButtonSelected],
    queryFn: () => fetchOrders(stateButtonSelected, typeButtonSelected),
    refetchOnWindowFocus: false,
  });

  const saveOrderMutation = useMutation({
    mutationFn: saveOrder,
    onSuccess: (savedOrderData) => {
      // Invalidate and refetch the main orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // If a new order was created, we might want to update the form data with the new ID
      if (savedOrderData && savedOrderData.DC_ID) {
        setPopupFormData(prev => ({ ...prev, ...savedOrderData }));
      }
      setToastConfig({ isVisible: true, type: "success", message: 'Zamówienie zapisane!' });
      dataGridRef.current.instance().cancelEditData();
    },
    onError: (error) => {
      setToastConfig({ isVisible: true, type: "error", message: `Błąd zapisu: ${error.message}` });
    },
  });

  const removeOrderMutation = useMutation({
    mutationFn: removeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setToastConfig({ isVisible: true, type: "info", message: 'Zamówienie usunięte.' });
    },
    onError: (error) => {
      setToastConfig({ isVisible: true, type: "error", message: `Błąd usuwania: ${error.message}` });
    },
  });

  // --- Event Handlers ---
  const handleSaving = async (e) => {
    e.cancel = true;

    const result = validationEngine.validateGroup("myGroup");
    if (!result.isValid) {
      return;
    }
    await saveOrderMutation.mutateAsync(popupFormData);
  };
  const handleRowRemoving = async (e) => {
    e.cancel = true; 
    await removeOrderMutation.mutateAsync(e.data.DC_ID);
  };

  const onPopupHiding = () => {
    setIsPopupVisible(false);
    setPopupFormData({ DC_TYPE: "S", DC_DELIVERY: 100 });
    // Invalidate queries to ensure data is fresh if user cancels
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const popupToolbarItems = [
    {
      toolbar: 'bottom',
      location: 'after',
      widget: 'dxButton',
      options: {
        text: 'Zapisz',
        type: 'default', stylingMode: 'contained',
        onClick: () => dataGridRef.current.instance().saveEditData(),
      },
    },
    {
      toolbar: 'bottom',
      location: 'after',
      widget: 'dxButton',
      options: {
        text: 'Anuluj',
        type: 'default', stylingMode: 'outlined',
        onClick: () => dataGridRef.current.instance().cancelEditData(),
      },
    },
  ];

  return (
    <div className="dx-card ordersContainer" style={{ padding: "15px" }}>
      <div className="buttonGroupContainer">
        <ButtonGroup
          items={stateValues}
          keyExpr="state"
          selectionMode="multiple"
          onSelectionChanged={(e) => setStateButtonSelected(e.component.option("selectedItemKeys"))}
        />
        <ButtonGroup
          items={typeValues}
          keyExpr="type"
          selectionMode="multiple"
          onSelectionChanged={(e) => setTypeButtonSelected(e.component.option("selectedItemKeys"))}
        />
      </div>

      <DataGrid
        ref={dataGridRef}
        width={"100%"}
        dataSource={ordersData}
        keyExpr="DC_ID"
        showBorders={true}
        showRowLines={true}
        showColumnLines={true}
        allowColumnResizing={true}
        columnResizingMode="widget"
        onSaving={handleSaving}
        onRowRemoving={handleRowRemoving}
        onEditingStart={(e) => {
          // Deep copy data to avoid mutating cache directly
          const formData = JSON.parse(JSON.stringify(e.data));
          setPopupFormData(formData);
          setIsPopupVisible(true);
        }}
        onInitNewRow={() => {
          setPopupFormData({ DC_TYPE: "S", DC_DELIVERY: 100 });
          setIsPopupVisible(true);
        }}
        onRowPrepared={(e) => {
          if (e.rowType === 'data') {
            // Class name logic is unchanged
            const stateClassMap = { P: 'production-row', H: 'hartowanie-row', T: 'hartowanie-row', Z: 'zamowione-row', C: 'ciecie-row', R: 'ramki-row', B: 'baza-row', G: 'gotowe-row', W: 'wyslane-row', D: 'dostarczone-row', A: 'dostarczone-row' };
            if (stateClassMap[e.data.DC_STATE]) {
              e.rowElement.classList.add(stateClassMap[e.data.DC_STATE]);
            }
          }
        }}
      >
        <Editing
          mode="popup"
          allowDeleting={true}
          allowAdding={true}
          allowUpdating={true}
        >
          <Popup
            visible={isPopupVisible}
            onHiding={onPopupHiding}
            showTitle={true}
            showCloseButton={true}
            width={'100%'}
            height={'100%'}
            toolbarItems={popupToolbarItems}
          />
          <Form validationGroup="myGroup" colCount={1}>
            <Item itemType="simple" render={() =>
              <OrderPopup
                data={popupFormData}
                formData={popupFormData}
                setFormData={setPopupFormData}
                saveOrderMutation={saveOrderMutation}
              />}
            />
          </Form>
        </Editing>

        {/* All other DataGrid configurations like Paging, FilterRow, Columns, etc. remain the same */}
        <Paging defaultPageSize={15} />
        <Pager visible={true} allowedPageSizes={[10, 20, 'all']} displayMode={'full'} showPageSizeSelector={true} showNavigationButtons={true} />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <ColumnChooser enabled={true} />
        <StateStoring enabled={true} type="localStorage" storageKey="dataGridClaims" />
        <MasterDetail enabled={true} component={DataGridDetail} />

        <Column dataField="DC_ID" caption="Nr Zamówienia" />
        <Column dataField="DC_TYPE" caption="Typ" defaultVisible={false} />
        <Column dataField="DC_RTIME" caption="Data" dataType="datetime" format={"dd/MM/yyyy, HH:mm"} />
        <Column dataField="DC_DTIME" caption="Termin" dataType="datetime" format={"dd/MM/yyyy, HH:mm"} />
        <Column dataField="DC_STATE" caption="Stan" />
        <Column dataField="DC_C_NUMBER" caption="Nr Zamówienia Kontrahenta" />
        <Column dataField="DC_QNT" caption="Ilość" />
        <Column dataField="DC_R_QNT" caption="Rozliczone" />
        <Column dataField="DC_DELIVERY" caption="Sposób dostawy">
          <Lookup dataSource={deliveryValues} valueExpr="value" displayExpr="label" />
        </Column>

        <Toolbar>
          <Item location="before"><h2>Zamówienia</h2></Item>
          <Item name="columnChooserButton" />
          <Item name="addRowButton" />
        </Toolbar>
      </DataGrid>

      <Toast
        position={{ at: "bottom center", my: "bottom center" }}
        visible={toastConfig.isVisible}
        message={toastConfig.message}
        type={toastConfig.type}
        onHiding={() => setToastConfig(prev => ({ ...prev, isVisible: false }))}
        displayTime={3000}
      />
    </div>
  );
}
