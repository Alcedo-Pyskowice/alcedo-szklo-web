import DataGrid from "devextreme-react/data-grid"
import ButtonGroup from "devextreme-react/button-group";
import Toast from "devextreme-react/toast";
import { ToolbarItem } from "devextreme-react/popup";
import { Column, ColumnChooser, Editing, FilterBuilderPopup, FilterPanel, FilterRow, Form, HeaderFilter, MasterDetail, Pager, Paging, Popup, Position, Toolbar, Item, StateStoring, Lookup } from "devextreme-react/data-grid";
import validationEngine from 'devextreme/ui/validation_engine';
import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "../../axios/instance";
import DataGridDetail from "./dataGridDetail";
import OrderPopup from "./orderPopup";
import "./orders.css"
import "./orders.scss"

export const deliveryValues = [
  {
    value: 100,
    label: "Stojaki/Transport"
  },
  {
    value: 200,
    label: "Stojaki/Odbiór własny"
  },
  {
    value: 250,
    label: "Luzem/Odbiór własny"
  }
]

export const dc_typeValues = [
  {
    value: 'S',
    label: 'Standard'
  },
  {
    value: 'R',
    label: 'Reklamacja'
  },
  {
    value: 'W',
    label: 'Wewnętrzne'
  },
  {
    value: 'Z',
    label: 'Zewnętrzne'
  }
]

export default function Orders() {

  //ozapgwdx
  const stateValues = [
    { text: 'O', state: 'O', hint: '' },
    { text: 'Z', state: 'Z', hint: '' },
    { text: 'A', state: 'A', hint: '' },
    { text: 'P', state: 'P', hint: '' },
    { text: 'G', state: 'G', hint: '' },
    { text: 'W', state: 'W', hint: '' },
    { text: 'D', state: 'D', hint: '' },
    { text: 'X', state: 'X', hint: '' }
  ]

  //svr
  const typeValues = [
    { text: 'S', type: 'S', hint: '' },
    { text: 'V', type: 'V', hint: '' },
    { text: 'R', type: 'R', hint: '' },
  ]

  const [toastConfig, setToastConfig] = useState({
    isVisible: false,
    type: "error",
    message: '',
  })

  const toastOnHiding = () => {
    setToastConfig({
      ...toastConfig,
      isVisible: false
    })
  }

  const stateButtonGroupRef = useRef(null)
  const typeButtonGroupRef = useRef(null)

  const [ordersDataGridData, setOrdersDataGridData] = useState([])

  const handleFieldDataChanged = useCallback((e) => {
    setPopupFormData((prevData) => ({
      ...prevData,
      [e.dataField]: e.value,
    }));
    console.log('Field changed:', e.dataField, e.value);
  }, []);

  const [popupFormData, setPopupFormData] = useState()
  const [editingData, setEditingData] = useState(null)
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [stateButtonSelected, setStateButtonSelected] = useState()
  const [typeButtonSelected, setTypeButtonSelected] = useState()

  const updateDataGrid = async () => {
    let params = { page: 1, limit: 100 }
    // checking whether all state or type buttons are selected or deselected. if either is false, the remaining selection of the group is added as a parameter with corresponding name.
    // if either are true, the group isnt added to the parameters
    if (stateButtonGroupRef != null && typeButtonGroupRef != null) {
      const stateButtonGroupSelected = stateButtonGroupRef.current.instance().option('selectedItemKeys')
      const typeButtonGroupSelected = typeButtonGroupRef.current.instance().option('selectedItemKeys')
      if (stateButtonGroupSelected.length != stateValues.length || stateButtonGroupSelected.length === 0) {
        params["DC_STATE"] = stateButtonGroupSelected.join(",")
      }
      if (typeButtonGroupSelected.length != typeValues.length || typeButtonGroupRef.length === 0) {
        params["DC_TYPE"] = typeButtonGroupSelected.join(",")
      }
    }
    try {
      const response = await axiosInstance.get("/orders/1/15", {
        params: params
      })
      setOrdersDataGridData(response.data.data)
    } catch (error) {
      console.log(error)
      setToastConfig({
        ...toastConfig,
        isVisible: true,
        message: error.message
      })
    }
  }

  useEffect(() => {
    updateDataGrid()
  }, [])

  const makeDTIME = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${min}`;
  }

  const saveOrder = async () => {
    const result = validationEngine.validateGroup("myGroup");
    if (!result.isValid) {
      return
    }
    const DC_ID = popupFormData.DC_ID ? popupFormData.DC_ID : 0;
    const body = {
      data: {
        "DC_ID": popupFormData.DC_ID,
        "DC_NO": popupFormData.DC_NO,
        "DC_C_NUMBER": popupFormData.DC_C_NUMBER,
        "DC_COMMENTS": popupFormData.DC_COMMENTS,
        "DC_ADDRESS": popupFormData.DC_ADDRESS,
        "DC_DTIME": new Date(popupFormData.DC_DTIME),
        "DC_CONTACT": popupFormData.DC_CONTACT,
        "DC_DELIVERY": popupFormData.DC_DELIVERY,
        "DC_TYPE": popupFormData.DC_TYPE
      }
    }
    try {
      const response = await axiosInstance.put(`/order/save?DC_ID=${DC_ID}`, body)
      return response.data.data[0];
    } catch (error) {
      console.log(error)
    }
  }

  const removeOrder = async (DC_ID) => {
    try {
      const response = await axiosInstance.post(`/order/delete/${DC_ID}`)
      return response
    } catch (error) {
      console.log(error)
    }
  }

  const handleSave = async () => {
    const result = validationEngine.validateGroup("myGroup");
    if (!result.isValid) {
      return
    }
    await saveOrder();
    updateDataGrid();
    setIsPopupVisible(false)
  };

  const handleCancel = (e) => {
    setIsPopupVisible(false)
  };

  const handleApprove = () => {
    // Custom approve logic
    console.log('Approved!');
    // You might close the popup after this action
  };

  return (
    <div className="dx-card ordersContainer" style={{ padding: "15px" }}>
      <div className="buttonGroupContainer">
        <ButtonGroup
          ref={stateButtonGroupRef}
          items={stateValues}
          keyExpr="state"
          selectionMode="multiple"
          onSelectionChanged={updateDataGrid}
        />
        <ButtonGroup
          ref={typeButtonGroupRef}
          items={typeValues}
          keyExpr="type"
          selectionMode="multiple"
          onSelectionChanged={updateDataGrid}
        />
      </div>

      <DataGrid
        dataSource={ordersDataGridData}
        showBorders={true}
        allowColumnResizing={true}
        columnResizingMode="widget"
        showRowLines={true}
        showColumnLines={true}
        columnChooser={{ enabled: true, mode: "select" }}
        onSaving={async (e) => {
          const editType = e.changes || []
          const hasRemove = editType.some(c => c.type === "remove")
          if (!hasRemove) {
            const result = validationEngine.validateGroup("myGroup");
            if (!result.isValid) {
              e.cancel = true; // prevents popup closing on invalid input
              return
            }
            if (!popupFormData.DC_CONTACT) {
              e.cancel = true;
              return
            }
            await saveOrder();
            updateDataGrid();
          }
        }}
        onRowRemoving={async (e) => {
          const response = await removeOrder(e.data.DC_ID)
          if (response.status !== 200) {
            e.cancel = true;
            return
          }
        }}
        onRowPrepared={(e) => {
          if (e.rowType === 'data') {
            switch (e.data.DC_STATE) {
              case 'P':
                e.rowElement.classList.add('production-row')
                break;
              case 'H':
                e.rowElement.classList.add('hartowanie-row')
                break;
              case 'T':
                e.rowElement.classList.add('hartowanie-row')
                break;
              case 'Z':
                e.rowElement.classList.add('zamowione-row')
                break;
              case 'C':
                e.rowElement.classList.add('ciecie-row')
                break;
              case 'R':
                e.rowElement.classList.add('ramki-row')
                break;
              case 'B':
                e.rowElement.classList.add('baza-row')
                break;
              case 'G':
                e.rowElement.classList.add('gotowe-row')
                break;
              case 'W':
                e.rowElement.classList.add('wyslane-row')
                break;
              case 'D':
                e.rowElement.classList.add('dostarczone-row')
                break;
              case 'A':
                e.rowElement.classList.add('dostarczone-row')
                break;
              default:
                break;
            }
          }
        }}
        onInitNewRow={() => setIsAddingRow(true)}
        onEditingStart={(e) => {
          setEditingData(e.data);
          setPopupFormData({ ...popupFormData, ...e.data });
          setIsPopupVisible(true);
          console.log(e);
        }}
      >
        <Editing
          mode="popup"
          allowDeleting
          allowAdding
          allowUpdating
        >
          <Popup
            visible={isPopupVisible}
            onHiding={() => { setIsPopupVisible(false); setEditingData(null); setPopupFormData({ DC_TYPE: "S", DC_DELIVERY: 100 }); setIsAddingRow(false); updateDataGrid() }}
            showTitle={true}
            showCloseButton={true}
            width={'100%'}
            height={'100%'}
          >
            <toolbarItems>
              {/* 
              * custom buttony na dole calego popupu
              * trzeba zrobic: 
              * save - to samo co w onSave chyba
              * cancel chowa calosc
              * pobierz (do jsona)
              * pobierz do pdf
              * drukuj?
              * zamow?
              */}
              <ToolbarItem
                widget="dxButton"
                toolbar="bottom"
                location="before"
                options={{
                  text: 'Pobierz',
                  type: 'default',
                  stylingMode: 'outlined',
                  //onClick: handleSave,
                }}
              />
              <ToolbarItem
                widget="dxButton"
                toolbar="bottom"
                location="before"
                options={{
                  text: 'Pobierz do PDF',
                  type: 'default',
                  stylingMode: 'outlined',
                  //onClick: handleSave,
                }}
              />
              <ToolbarItem
                widget="dxButton"
                toolbar="bottom"
                location="before"
                options={{
                  text: 'Drukuj',
                  type: 'default',
                  stylingMode: 'outlined',
                  //onClick: handleSave,
                }}
              />
              <ToolbarItem
                widget="dxButton"
                toolbar="bottom"
                location="before"
                options={{
                  text: 'Zamów',
                  type: 'default',
                  stylingMode: 'outlined',
                  //onClick: handleSave,
                }}
              />
              <ToolbarItem
                widget="dxButton"
                toolbar="bottom"
                location="after"
                options={{
                  text: 'Zapisz',
                  type: 'default',
                  stylingMode: 'contained',
                  onClick: handleSave,
                }}
              />
              <ToolbarItem
                widget="dxButton"
                toolbar="bottom"
                location="after"
                options={{
                  text: 'Anuluj',
                  stylingMode: 'outlined',
                  onClick: handleCancel,
                }}
              />
            </toolbarItems>
          </Popup>
          <Form
            width={'100%'}
            colCount={1}
          >
            {editingData || isAddingRow ? (
              <Item itemType="simple" render={() => <OrderPopup data={editingData} formData={popupFormData} setFormData={setPopupFormData} handleFieldDataChanged={handleFieldDataChanged} saveNewOrder={saveOrder} />} />
            ) : null}
          </Form>
        </Editing>
        <ColumnChooser>
          <Position
            my="right top"
            at="right bottom"
            of=".dx-datagrid-column-chooser-button"
          />
        </ColumnChooser>
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="dataGridClaims"
        />
        <Paging defaultPageSize={10} />
        <Pager
          visible={true}
          allowedPageSizes={[10, 20, 'all']}
          displayMode={'full'}
          showPageSizeSelector={true}
          showNavigationButtons={true}
        />
        <FilterRow visible={true} />
        <FilterPanel visible={true} />
        <FilterBuilderPopup position={{
          of: window,
          at: 'top',
          my: 'top',
          offset: { y: 10 },
        }} />
        <HeaderFilter visible={true} />
        <Column
          dataField="DC_ID"
          caption="Nr Zamówienia"
        />
        <Column
          dataField="DC_TYPE"
          caption="Typ"
          defaultVisible={false}
        />
        <Column
          dataField="DC_RTIME"
          caption="Data"
        />
        <Column
          dataField="DC_DTIME"
          caption="Termin"
        />
        <Column
          dataField="DC_STATE"
          caption="Stan"
        />
        <Column
          dataField="DC_C_NUMBER"
          caption="Nr Zamówienia Kontrahenta"
        />
        <Column
          dataField="DC_QNT"
          caption="Ilość"
        />
        <Column
          dataField="DC_R_QNT"
          caption="Rozliczone"
        />
        <Column
          dataField="DC_DELIVERY"
          caption="Sposób dostawy"
        >
          <Lookup
            dataSource={deliveryValues}
            valueExpr="value"
            displayExpr="label"
          />
        </Column>
        <MasterDetail
          enabled={true}
          component={DataGridDetail}
        />
        <Toolbar>
          <Item location="before">
            <h2>Zamówienia</h2>
          </Item>
          <Item name="columnChooserButton" />
          <Item name="addRowButton" />
        </Toolbar>
      </DataGrid>

      <Toast
        position={{ at: "bottom center", my: "bottom center", offset: '112% -20' }}
        visible={toastConfig.isVisible}
        message={toastConfig.message}
        type={toastConfig.type}
        onHiding={toastOnHiding}
        displayTime={3000}
      />
    </div>
  )
}
