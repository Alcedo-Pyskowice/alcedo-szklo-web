import { Form } from "devextreme-react";
import { GroupItem, Item } from "devextreme-react/form";
import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../axios/instance";

export default function Profile() {

  const [paramFormData, setParamFormData] = useState([])
  const [formValues, setFormValues] = useState({})
  useEffect(() => {
    fetchParams()
  }, [])

  const fetchParams = async () => {
    try {
      const response = await axiosInstance.get(`/profile/parameters?group=10,14,17,99&columns=2`)
      setParamFormData(response.data.data)
      setFormValues(makeValues(response.data.data))
    } catch (error) {

    }
  }

  const updateParam = async (id, value) => {
    try {
      const response = await axiosInstance.put(`/profile/parameter/update`, { data: { USP_ID: id, USP_VALUE: value } });
      return response;
    } catch (error) {

    }
  }

  const makeValues = (data) => {
    const a = data.reduce((acc, item) => {
      acc[item.PA_SYMBOL] = item.USP_VALUE
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

    // Use a Map to hold the final column objects.
    // The key is the column index ('1', '2', etc.).
    const columnsMap = new Map();

    // Start with a default column key. This will be used for any items
    // that appear before the first group header.
    let currentColumnKey = '1';

    // Process all items in a single pass to maintain order.
    paramFormData.forEach(item => {
      // Check if the item is a group header.
      if (item.PA_TYPE === '.') {
        // A group header defines which column it and subsequent items belong to.
        // If it has a 'column' property, update our current column key.
        // Otherwise, it belongs to the column of the previous header, or '1'.
        if (item.column) {
          currentColumnKey = item.column.toString();
        }

        // Ensure a container for this column exists in the map.
        if (!columnsMap.has(currentColumnKey)) {
          columnsMap.set(currentColumnKey, {
            id: `column-container-${currentColumnKey}`,
            innerGroups: [],
          });
        }

        // This header starts a new inner group within its column.
        columnsMap.get(currentColumnKey).innerGroups.push({
          id: item.PA_ID,
          caption: item.PA_VALUE, // The visible caption for the group
          items: [],
        });

      } else { // This is a regular form field item.

        // It belongs to the current column. Ensure the column container exists.
        if (!columnsMap.has(currentColumnKey)) {
          columnsMap.set(currentColumnKey, {
            id: `column-container-${currentColumnKey}`,
            innerGroups: [],
          });
        }

        const columnContainer = columnsMap.get(currentColumnKey);

        // Ensure there's at least one inner group to add items to.
        // This handles items that appear before the first group header.
        if (columnContainer.innerGroups.length === 0) {
          columnContainer.innerGroups.push({
            id: `default-group-for-col-${currentColumnKey}`,
            caption: undefined, // This default group is captionless
            items: [],
          });
        }

        // Add the regular item to the last inner group of the current column.
        const lastGroup = columnContainer.innerGroups[columnContainer.innerGroups.length - 1];
        lastGroup.items.push(item);
      }
    });

    // Convert the map to a sorted array for stable rendering order.
    // This sorts by column key ('1', '2', etc.).
    const finalColumns = Array.from(columnsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
      .map(entry => entry[1]);

    return finalColumns;

  }, [paramFormData]);

  return (
    <div className="dx-card"
      style={{ padding: "15px" }}
    >
      <Form
        formData={formValues}
        colCount={4} // Example: a 4-column grid for the whole form
      >
        {console.log(groupedData)}
        {/* Loop 1: Render the top-level Column Groups */}
        {groupedData.map((columnGroup) => (
          <GroupItem
            key={columnGroup.id}
            caption={columnGroup.caption}
            // Adjust colSpan based on your layout. For two columns, use colSpan={2}.
            colSpan={2}
          >
            {/* Loop 2: Render the Inner Groups inside each column */}
            {columnGroup.innerGroups.map((innerGroup) => (
              <GroupItem
                key={innerGroup.id}
                caption={innerGroup.caption}
              >
                {/* Loop 3: Render the Items inside each inner group */}
                {innerGroup.items.map((item) => {
                  // ... your existing switch logic to determine eType and eOptions ...
                  let eType = "";
                  let eOptions = {};

                  switch (item.PA_TYPE) {
                    case "S": eType = "dxTextBox"; break;
                    case "I": eType = "dxNumberBox"; break;
                    case "P":
                      eType = "dxNumberBox";
                      eOptions.format = item.PA_FORMAT;
                      break;
                    case "B": eType = "dxCheckBox"; break;
                    default: return null;
                  }

                  return (
                    <Item
                      dataField={item.PA_SYMBOL}
                      key={item.PA_ID}
                      editorType={eType}
                      label={{ text: item.PA_NAME }}
                      editorOptions={{
                        onValueChanged: async (e) => {
                          const response = await updateParam(item.USP_ID, e.value)
                          if (item.PA_SYMBOL === "ANAM" && response.status === 200) {
                            localStorage.setItem('name', e.value)
                          }
                        },
                        ...eOptions,
                      }}
                    />
                  );
                })}
              </GroupItem>
            ))}
          </GroupItem>
        ))}
      </Form>
    </div>
  );
}

