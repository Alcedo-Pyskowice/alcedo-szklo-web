import Button from "devextreme-react/button"
import Chart from "devextreme-react/chart"
import DataGrid from "devextreme-react/data-grid"
import DateRangeBox from "devextreme-react/date-range-box"
import TabPanel from "devextreme-react/tab-panel"
import Toast from "devextreme-react/toast"
import { Item } from "devextreme-react/tab-panel"
import { useContext, useRef, useState, useEffect } from "react";
import {
  Column,
  FilterBuilderPopup,
  FilterPanel,
  FilterRow,
  HeaderFilter,
  Pager,
  Paging,
  StateStoring
} from "devextreme-react/data-grid";
import { CommonSeriesSettings, SeriesTemplate, Tooltip } from "devextreme-react/chart";
import { ThemeContext } from "../../theme";
import axiosInstance from "../../axios/instance";


export default function Claims() {
  const themeContext = useContext(ThemeContext);

  // daterangebox controls
  const msInDay = 86400000;
  const now = new Date()
  const dateRangeBoxRef = useRef(null)
  const [dateRangeBoxValue, setDateRangeBoxValue] = useState(localStorage.getItem("dateRangeBoxValue") != null ? [
    new Date(JSON.parse(localStorage.getItem("dateRangeBoxValue"))[0]),
    new Date(JSON.parse(localStorage.getItem("dateRangeBoxValue"))[1])
  ] : [
    new Date(now.getTime() - msInDay * 30),
    new Date(now.getTime()),
  ]);
  const [startDate, setStartDate] = useState(dateRangeBoxValue[0].getFullYear() + '-' + (dateRangeBoxValue[0].getMonth() + 1) + '-' + dateRangeBoxValue[0].getDate())
  const [endDate, setEndDate] = useState(dateRangeBoxValue[1].getFullYear() + '-' + (dateRangeBoxValue[1].getMonth() + 1) + '-' + dateRangeBoxValue[1].getDate())

  const onValueChangeDateRangeBox = (e) => {
    const dates = [new Date(e.value[0]), new Date(e.value[1])]
    setStartDate(dates[0].getFullYear() + '-' + (dates[0].getMonth() + 1) + '-' + dates[0].getDate())
    setEndDate(dates[1].getFullYear() + '-' + (dates[1].getMonth() + 1) + '-' + dates[1].getDate())
    setDateRangeBoxValue(e.value);
    localStorage.setItem("dateRangeBoxValue", JSON.stringify(e.value));
  }

  const [chartData, setChartData] = useState()
  const [gridData, setGridData] = useState()

  // useEffect for getting the data to update as the site is accessed
  // date is stored in localStorage in order to "preserve" the state of the data
  // could use sessionStorage

  useEffect(() => {
    const saved = localStorage.getItem("dateRangeBoxValue");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const dates = [new Date(parsed[0]), new Date(parsed[1])];
        setDateRangeBoxValue(dates);
        setStartDate(dates[0].getFullYear() + '-' + (dates[0].getMonth() + 1) + '-' + dates[0].getDate())
        setEndDate(dates[1].getFullYear() + '-' + (dates[1].getMonth() + 1) + '-' + dates[1].getDate())
      } catch (e) {
        console.error('Failed to parse saved date range:', e);
      }
    }
    update()

  }, [])

  // handling the button click

  const update = async () => {
    //
    try {
      const response = await axiosInstance.get(`/orders/claims/1/1/${startDate}/${endDate}/C`)
      console.log(response.data.data)
      setGridData(response.data.data)
      // preparation for the chart
      if (response.data.data.length > 0) {
        const res = chartDataPrep(response.data.data);
        const transformedData = [];
        res.forEach((item) => {
          const { month, ...series } = item;
          Object.keys(series).forEach((seriesName) => {
            transformedData.push({
              month,
              series: seriesName,
              value: series[seriesName]
            });
          });
        });
        setChartData(transformedData)
      }
    } catch (error) {
      console.log(error)
      //      if (error.response.status == 400) {
      //        setToastConfig({
      //          ...toastConfig,
      //          isVisible: true,
      //          message: error.response.data.message
      //        })
      //}
    }
  }

  // chart data preparation 
  // comes out in array of objects {month: YYYY-MM, option: "TP_OPTIONS"}

  const chartDataPrep = (data) => {
    let arr = []
    arr[0] = { "month": data[0].DC_DATE.substring(0, 7) }
    let exists = true;
    for (let i = 0; i < data.length; i++) {
      let option = data[i].TP_OPTIONS
      if (option == "") {
        option = "Pusty parametr"
      }
      for (let j = 0; j < arr.length; j++) {
        if (arr[j].month == data[i].DC_DATE.substring(0, 7)) {
          exists = true;
          if (Object.keys(arr[j]).includes(option)) {
            arr[j][option] += 1
          } else {
            // append claim to object in arr[j]
            arr[j][option] = 1
          }
        } else {
          exists = false;
        }
      }
      if (!exists) {
        arr.push({ "month": data[i].DC_DATE.substring(0, 7) })
        exists = true;
      }
    }
    return arr
  }


  // chart controls

  function onLegendClick({ target: series }) {
    if (series.isVisible()) {
      series.hide();
    } else {
      series.show();
    }
  }

  const customizeTooltip = (args) => {
    return {
      html: `<div className="tooltip-template">${args.seriesName}: ${args.value}</div>`,
    };
  };


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


  /*      className={`dx-swatch-additional${theme?.isDark() ? '-dark' : ''} side-navigation-menu`} */
  return (

    <div
      className="dx-card"
      style={{
        padding: "15px",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column"
      }}
    >

      <TabPanel
        style={{ width: "100%", display: "flex", justifyContent: "center", alignContent: "center" }}
        deferRendering={false}
        // focusStateitemComponent={({ data }) => data.component}Enabled odpowiada za nawigacje przy pomocy tab i klawiatury
        // jakos trzeba znalezc sposob zeby podczas klikania myszka nie bylo tego, ale dalej byla mozliwosc uzycia klawiatury
        focusStateEnabled={false}
      >
        <Item title="Zestawienie">
          <DataGrid
            dataSource={gridData}
            showBorders={true}
            allowColumnResizing={true}
            showRowLines={true}
            showColumnLines={true}
            wordWrapEnabled={true}
            onRowPrepared={(e) => {
              if (e.rowType === 'data') {
                switch (e.data.TP_STATE) {
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
          >
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
              dataField="DC_NUMBER"
              caption="Numer"
            />
            <Column
              dataField="TK_SYMBOL"
              caption="Kontrahent"
            />
            <Column
              dataField="TP_OPTIONS"
              caption="Opcje"
            />
            <Column
              dataField="TP_SYMBOL"
              caption="Symbol"
              width={200}
            />
            <Column
              dataField="TP_NAME"
              caption="Opis"
              width={350}
            />
            <Column
              dataField="TP_LENGTH"
              caption="Szerokosc"
            />
            <Column
              dataField="TP_WIDTH"
              caption="Wysokosc"
            />
            <Column
              dataField="TP_QNT"
              caption="Ilosc"
            />
          </DataGrid>

        </Item>

        <Item title="Wykres">
          <div className="dx-card" style={{ padding: "10px", margin: "10px" }}>
            <Chart
              dataSource={chartData}
              theme={
                `material.blue.${themeContext?.theme}`
              }
              palette={"Office"}
              onLegendClick={onLegendClick}
              title={"Reklamacje"}
            >
              <CommonSeriesSettings
                argumentField="month"
                valueField="value"
                type="bar"
                ignoreEmptyPoints={true}
              >
              </CommonSeriesSettings>
              <SeriesTemplate nameField="series" />"
              <Tooltip enabled={true} customizeTooltip={customizeTooltip} />
            </Chart>
          </div>
        </Item>
      </TabPanel>


      <DateRangeBox
        style={{ width: "50%", alignSelf: 'center' }}
        calendarOptions={{ maxZoomLevel: "year" }}
        startDateLabel="Poczatek"
        endDateLabel="Koniec"
        labelMode="floating"
        useMaskBehavior={true}
        onValueChanged={onValueChangeDateRangeBox}
        displayFormat="MM/yyyy"
        value={dateRangeBoxValue}
        ref={dateRangeBoxRef}
      />

      <Button
        onClick={update}
        text={"Pobierz reklamacje"}
        style={{ width: "50%", alignSelf: 'center', marginTop: "20px" }}

      />
      <Toast
        position={{ at: "bottom center", my: "bottom center", offset: '112% -20' }}
        visible={toastConfig.isVisible}
        message={toastConfig.message}
        type={toastConfig.type}
        onHiding={toastOnHiding}
        displayTime={600}
      />
    </div>

  )
}

