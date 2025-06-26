import { DataGrid } from "devextreme-react";
import { Column, ColumnChooser, Toolbar, Item, FilterBuilderPopup, FilterPanel, FilterRow, Form, HeaderFilter, MasterDetail, Pager, Paging, Popup, Position, StateStoring } from "devextreme-react/data-grid";
import { useEffect, useState } from "react";
import axiosInstance from "../../axios/instance";

import "./racks.css"

export default function Racks() {
  const [racksDataGridData, setRacksDateGridData] = useState([])

  useEffect(() => {
    fetchRacks()
  }, [])

  const fetchRacks = async () => {
    try {
      const response = await axiosInstance.get('/users/racks/used/20/1/1000000')
      setRacksDateGridData(response.data.data)
      console.log(response.data.data)
    } catch (error) {

    }
  }
  return (
    <div className="dx-card" style={{ padding: "15px" }}>
      <DataGrid
        dataSource={racksDataGridData}
        showBorders={true}
        allowColumnResizing={true}
        showRowLines={true}
        showColumnLines={true}
        columnChooser={{ enabled: true, mode: "select" }}
        onRowPrepared={(e) => {
          if (e.rowType === 'data' && e.data.TH_DATA_OK == 'T') {
            e.rowElement.classList.add('success-row')
          }
        }}
      >
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
          dataField="TD_ID"
          caption="ID Stojaka"
          defaultVisible={false}
        />
        <Column
          dataField="TD_SYMBOL"
          caption="Symbol"
        />
        <Column
          dataField="TH_TIME"
          caption="Czas wysyłki"
        />
        <Column
          dataField="TH_EVENT"
          caption="Zdarzenie"
        />
        <Column
          dataField="TH_DAYS"
          caption="Liczba dni"
        />
        <Column
          dataField="TH_DAYS_EXP"
          caption="Dni przeter."
        />
        <Column
          dataField="TH_DATA_OK"
          caption="Dane"
        />
        <Toolbar>
          <Item location="before">
            <h2>Stojaki</h2>
          </Item>
          <Item name="columnChooserButton"/>
        </Toolbar>
      </DataGrid>
    </div>
  )
}
