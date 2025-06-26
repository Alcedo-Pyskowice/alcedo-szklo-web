import React, { useMemo, useCallback } from 'react';
import DropDownButton from 'devextreme-react/drop-down-button';
import List from 'devextreme-react/list';
import { useAuth } from '../../contexts/auth';
import './UserPanel.scss';


export default function UserPanel({ menuMode }) {
  const { signOut } = useAuth();

  const menuItems = useMemo(() => ([
    {
      text: 'Logout',
      icon: 'runner',
      onClick: signOut
    }
  ]), [signOut]);

  const dropDownButtonAttributes = {
    class: 'user-button'
  };

  const buttonDropDownOptions = {
    width: '150px'
  };

  return (
    <div className='user-panel'>
      {menuMode === 'context' && (
        <DropDownButton
            // tutaj ikona od dropdown listy profilu
            stylingMode='text'
            icon='user'
            showArrowIcon={false}
            elementAttr={dropDownButtonAttributes}
            dropDownOptions={buttonDropDownOptions}
            items={menuItems}>
        </DropDownButton>
      )}
      {menuMode === 'list' && (
        <List items={menuItems} />
      )}
    </div>
  );
}
