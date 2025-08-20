import { Routes, Route, Navigate } from 'react-router-dom';
import { SingleCard } from './layouts';
import { LoginForm, ResetPasswordForm, ChangePasswordForm, CreateAccountForm } from './components';

export default function UnauthenticatedContent() {
  return (
    <Routes>
      <Route
        path='/login' 
        element={
          <SingleCard title="Logowanie">
            <LoginForm />
          </SingleCard>
        }
      />
      <Route
        path='/create-account'
        element={
          <SingleCard title="Rejestracja">
            <CreateAccountForm />
          </SingleCard>
        }
      />
      <Route 
        path='/reset-password'
        element={
          <SingleCard
            title="Zapomniałeś hasła?"
            description="Wprowadź email użyty podczas rejestracji. Link do zresetowania hasła otrzymasz na skrzynkę mailową"
          >
            <ResetPasswordForm />
          </SingleCard>
        }
      />
      <Route
        path='/change-password/:recoveryCode'
        element={
          <SingleCard title="Zmień hasło">
            <ChangePasswordForm />
          </SingleCard>
        }
      />
      <Route path='*' element={<Navigate to={'/login'} />}></Route>
    </Routes>
  );
}
