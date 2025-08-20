import React, { useMemo, useCallback } from 'react';
import DropDownButton from 'devextreme-react/drop-down-button';
import List from 'devextreme-react/list';
import { useAuth } from '../../contexts/auth';
import './UserPanel.scss';
import { useNavigate } from 'react-router-dom';


export default function UserPanel({ menuMode }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navigateToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);


  const menuItems = useMemo(() => ([
    {
      text: 'Profil',
      icon: 'user',
      onClick: navigateToProfile
    },
    {
      text: 'Wyloguj',
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
