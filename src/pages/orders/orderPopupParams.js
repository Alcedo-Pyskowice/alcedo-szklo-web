import Form from "devextreme-react/form";
import { GroupItem, Item } from "devextreme-react/form";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../axios/instance";

export default function OrderPopupParams({ DC_ID }) {
  const [paramFormData, setParamFormData] = useState([])
  const [formValues, setFormValues] = useState({})
  useEffect(() => {
    fetchParams()
  }, [])

  const fetchParams = async () => {
    try {
      const response = await axiosInstance.get(`/order/parameters/${DC_ID}`)
      setParamFormData(response.data.data)
      setFormValues(makeValues(response.data.data))
    } catch (error) {

    }
  }

  const updateParam = async (DCP_ID, DCP_VALUE) => {
    try {
      const response = await axiosInstance.put(`/order/parameter/update`, { data: { DCP_ID: DCP_ID, DCP_VALUE: DCP_VALUE } });
      return response;
    } catch (error) {

    }
  }

  const makeValues = (data) => {
    const a = data.reduce((acc, item) => {
      acc[item.PA_SYMBOL] = item.DCP_VALUE
      return acc
    }, {})
    console.log(a)
    return a;
  }

  // This groups items under the most recent group caption encountered.
  const groupedData = useMemo(() => {
    if (!paramFormData || paramFormData.length === 0) {
      return [];
    }

    return paramFormData.reduce((acc, item) => {
      // If the item type is '.', it's a group header. Start a new group.
      if (item.PA_TYPE === '.') {
        acc.push({
          id: item.PA_ID, // Use the ID for the key
          caption: item.PA_VALUE,
          items: []
        });
      } else {
        // If there are no groups yet, create a default one to hold items.
        if (acc.length === 0) {
          acc.push({ id: 'default-group-0', caption: undefined, items: [] });
        }
        // Add the current item to the last created group.
        acc[acc.length - 1].items.push(item);
      }
      return acc;
    }, []);
  }, [paramFormData]);

  return (
    <Form
      formData={formValues}
      colCount={4}
    >
      {console.log(groupedData)}
      {/* 2. Render the new grouped structure with nested loops */}
      {
        groupedData.map((group) => (
          <GroupItem
            key={group.id}
            caption={group.caption}
            colSpan={4} // Make the group span the full width of the form
          >
            {/* Loop over the items *within* this specific group */}
            {group.items.map((item) => {
              let eType = "";
              let eOptions = {};

              // This switch logic now runs for each item inside its group
              switch (item.PA_TYPE) {
                case "S":
                  eType = "dxTextBox";
                  break;
                case "I":
                  eType = "dxNumberBox";
                  break;
                case "P":
                  eType = "dxNumberBox";
                  eOptions.format = item.PA_FORMAT;
                  break;
                case "B":
                  eType = "dxCheckBox";
                  break;
                default:
                  // Return null or an empty fragment for unhandled types
                  return null;
              }

              return (
                <Item
                  dataField={item.PA_SYMBOL}
                  key={item.PA_ID}
                  editorType={eType}
                  label={{ text: item.PA_NAME }}
                  editorOptions={{
                    onValueChanged: async (e) => {
                      await updateParam(item.DCP_ID, e.value)
                    },
                    ...eOptions
                  }}
                  // Each item can still span the full width if desired
                  colSpan={4}
                />
              );
            })}
          </GroupItem>
        ))}
    </Form>
  );
}
