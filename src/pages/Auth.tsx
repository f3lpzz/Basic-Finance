import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <LoginForm 
      onToggleMode={() => setIsSignUp(!isSignUp)} 
      isSignUp={isSignUp} 
    />
  );
};

export default Auth;