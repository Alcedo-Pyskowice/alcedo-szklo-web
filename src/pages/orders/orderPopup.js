import { DataGrid, Form, TabPanel } from "devextreme-react";
import { Column, Editing, Popup, Form as DGForm } from "devextreme-react/data-grid";
import validationEngine from 'devextreme/ui/validation_engine';
import { Item, RequiredRule } from "devextreme-react/form";
import { Item as TabPanelItem } from "devextreme-react/tab-panel";
import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "../../axios/instance";
import OrderPopupPopup from "./orderPopupPopup";
import { dc_typeValues, deliveryValues } from "./orders";
import "./orders.css"
import OrderPopupAttachments from "./orderPopupAttachments";
import OrderPopupParams from "./orderPopupParams";

export default function OrderPopup({ data, formData, setFormData, handleFieldDataChanged, saveNewOrder }) {
  const [popupDataGridData, setPopupDataGridData] = useState([])
  const [popupFormData, setPopupFormData] = useState([])
  const [titleData, setTitleData] = useState()
  const [dtime, setDtime] = useState(null)
  const [tabsDisabled, setTabsDisabled] = useState(true)

  const getLabel = (val) => {
    const found = dc_typeValues.find((item) => item.value === val);
    return found ? found.label : val;
  };

  useEffect(() => {
    if (!formData) {
      setFormData({ DC_TYPE: "S", DC_DELIVERY: 100, DC_ID: 0})
    }
    if (data) {
      setTitleData({ DC_ID: data.DC_ID, DC_STATE: data.DC_STATE_TEXT, DC_RTIME: data.DC_RTIME })
      fetchPositions(data.DC_ID)
      setTabsDisabled(false)
    }
  }, [])

  const fetchPositions = async (DC_ID) => {
    try {
      const response = await axiosInstance.get(`/order/positions/${DC_ID}/1/1000000`)
      setPopupDataGridData(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handlePopupFieldDataChanged = useCallback((e) => {
    setPopupFormData((prevData) => ({
      ...prevData,
      [e.dataField]: e.value,
    }));
    //    console.log('Field changed:', e.dataField, e.value);
  }, []);

  const savePosition = async (DC_ID) => {
    try {
      const TP_ID = popupFormData.TP_ID ? popupFormData.TP_ID : 0;
      console.log(popupFormData)
      const TP_SHAPE = popupFormData.TP_SZPROS_KSZTALT.includes(0);
      const TP_MUNTINS = popupFormData.TP_SZPROS_KSZTALT.includes(1);
      const body = {
        data: {
          "TP_ID": TP_ID,
          "TP_DCID": DC_ID,
          "DC_NO": DC_ID,
          "TP_POS": popupFormData.TP_POS,
          "TP_SYMBOL": popupFormData.TP_SYMBOL,
          "TP_NAME": popupFormData.TP_NAME,
          "TP_TYPE": popupFormData.TP_TYPE,
          "TP_QNT": popupFormData.TP_QNT,
          "TP_G_QNT": popupFormData.TP_G_QNT,
          "TP_R_QNT": popupFormData.TP_R_QNT,
          "TP_T_QNT": popupFormData.TP_T_QNT,
          "TP_W": popupFormData.TP_W,
          "TP_H": popupFormData.TP_H,
          "TP_SHAPE": TP_SHAPE ? "1" : "0",
          "TP_IDENT": popupFormData.TP_IDENT,
          "TP_MUNTINS": TP_MUNTINS ? "T" : "N",
          "TP_WEIGHT": popupFormData.TP_WEIGHT
        }
      }
      console.log(body)
      const response = await axiosInstance.put(`/order/position/save/${TP_ID}`, body)
      return response;
    } catch (error) {

    }
  }

  const removePosition = async (ID) => {
    try {
      const response = await axiosInstance.post(`/order/position/delete/${ID}`)
      return response
    } catch (error) {

    }
  }

  const dataGridRef = useRef(null)

  const onToolbarPreparing = (e) => {
    e.toolbarOptions.items.forEach((item) => {
      if (item.name === 'addRowButton') {
        item.options = {
          ...item.options,
          onClick: (args) => {
            const result = validationEngine.validateGroup("myGroup");
            if (!result.isValid) {
              return;
            }
            dataGridRef.current.instance().addRow();
          },
        };
      }
    });
  };

  const colorMap = {
    Otwarte: '#007BFF',       // blue
    Zamówione: '#FFC107',     // yellow
    Akceptacja: '#FFC107',    // reuse yellow
    Produkcja: '#17A2B8',     // info-blue
    Gotowe: '#28A745',        // green
    Wysłane: '#218838',       // dark green
    Dostarczone: '#218838',   // dark green
    Anulowane: '#DC3545',     // red
    Usunięte: '#6C757D',      // gray
  };

  const dotColor = titleData != null ? colorMap[titleData.DC_STATE] : '#000';

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
      {titleData ?
        <span style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <h2 style={{ display: 'inline' }}>Zamówienie nr {titleData.DC_ID}</h2>
          <h2 className="state-span" style={{ display: 'inline', '--dot-color': dotColor }}>Status: {titleData.DC_STATE}</h2>
          <div style={{}}>
            <span style={{ margin: 0, fontSize: '1em', fontWeight: 'bold' }}>Data rejestracji</span>
            <h3 style={{ margin: 0 }}>{makeDate(titleData.DC_RTIME)}</h3>
          </div>
        </span>
        : null}
      <Form
        width={'100%'}
        labelMode="floating"
        colCount={4}
        formData={formData}
        onFieldDataChanged={handleFieldDataChanged}
        validationGroup="myGroup"
      >
        <Item
          dataField="DC_TYPE"
          editorType="dxSelectBox"
          editorOptions={{
            dataSource: dc_typeValues,
            valueExpr: 'value',
            displayExpr: 'label',
            defaultValue: 'Z'
          }}
          label={{ text: "Typ" }}
        />
        <Item
          dataField="DC_C_NUMBER"
          label={{ text: "Numer zamówienia kontrachenta" }}
        />
        <Item
          dataField="DC_DTIME"
          editorType="dxDateBox"
          editorOptions={{
            displayFormat: "dd/MM/yyyy, HH:mm",
            min: new Date(),
            type: "datetime",
            showAnalogClock: false
          }}
          label={{ text: "Termin dostawy" }}
        />
        <Item
          dataField="DC_DELIVERY"
          editorType="dxSelectBox"
          editorOptions={{
            dataSource: deliveryValues,
            valueExpr: 'value',
            displayExpr: 'label',
            defaultValue: deliveryValues[0].value
          }}
          label={{ text: "Sposób dostawy" }}
        />
        <Item
          dataField="DC_CONTACT"
          colSpan={4}
          isRequired={true}
          label={{ text: "Kontakt" }}
        >
          <RequiredRule message="To pole jest wymagane." />
        </Item>
        <Item
          dataField="DC_COMMENTS"
          editorType="dxTextArea"
          editorOptions={{
            height: 100
          }}
          colSpan={2}
          label={{ text: "Uwagi" }}
        />
        <Item
          dataField="DC_ADDRESS"
          editorType="dxTextArea"
          editorOptions={{
            height: 100
          }}
          colSpan={2}
          label={{ text: "Adres dostawy" }}
        />
      </Form>
      <TabPanel>
        <TabPanelItem title="Pozycje"
        >
          <DataGrid
            ref={dataGridRef}
            dataSource={popupDataGridData}
            showBorders={true}
            columnAutoWidth={true}
            allowColumnResizing={true}
            showRowLines={true}
            showColumnLines={true}
            onSaving={async (e) => {
              const result = validationEngine.validateGroup("myGroup");
              if (!result.isValid) {
                return
              }
              const editType = e.changes || []
              const hasRemove = editType.some(c => c.type === "remove")
              console.log(e)
              if (!hasRemove) {
                if (!data) {
                  // w response jest DC_ID pod ktorym zapisany zostal nowy order
                  try {
                    const newOrderResponse = await saveNewOrder()
                    const saveres = await savePosition(newOrderResponse.DC_NO);
                    console.log(saveres)
                    //to tez do poprawy chyba
                    const fetch = await fetchPositions(newOrderResponse.DC_ID)
                    console.log(fetch)
                    setTitleData({ DC_ID: newOrderResponse.DC_ID, DC_STATE: newOrderResponse.DC_STATE_TEXT, DC_RTIME: newOrderResponse.DC_RTIME })
                    setTabsDisabled(false)
                    console.log(newOrderResponse)
                    setFormData({...formData, DC_ID: newOrderResponse.DC_ID})
                    console.log(formData)
                  } catch (error) {

                  }
                } else {
                  try {
                    await savePosition(data.DC_NO);
                    await fetchPositions(data.DC_ID)
                  } catch (error) {

                  }
                }
              }
              console.log("formData: ", popupFormData)
              setPopupFormData([])
            }}
            onRowRemoving={async (e) => {
              const response = await removePosition(e.data.TP_ID)
              console.log(response)
              if (response.status !== 200) {
                e.cancel = true;
                return
              }
            }}

            onowPrepared={(e) => {
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
            onToolbarPreparing={onToolbarPreparing}
            onEditingStart={(e) => {
              const result = validationEngine.validateGroup("myGroup");
              if (!result.isValid) {
                e.cancel = true;
                return
              }
              setPopupFormData({ ...popupFormData, ...e.data });
            }}
          >
            <Editing
              mode="popup"
              allowDeleting
              allowAdding
              allowUpdating
            >
              <Popup
                showTitle={true}
                showCloseButton={true}
              />
              <DGForm
                width={'100%'}
                colCount={1}
              >
                <Item
                  itemType="simple"
                  render={() => <OrderPopupPopup formData={popupFormData} handleFieldDataChanged={handlePopupFieldDataChanged} />}
                />
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

        <TabPanelItem title="Parametry"
          disabled={tabsDisabled}
        >
          <OrderPopupParams DC_ID={formData.DC_ID} />

        </TabPanelItem>

        <TabPanelItem title="Załączniki"
          disabled={tabsDisabled}
        >
          <OrderPopupAttachments DC_ID={formData.DC_ID} />
        </TabPanelItem>
      </TabPanel>
    </div >
  )
}
