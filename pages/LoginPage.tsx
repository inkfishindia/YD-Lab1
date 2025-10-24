import React from 'react';

import { LightBulbIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-center px-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <LightBulbIcon className="w-10 h-10 text-blue-500" />
          <span className="ml-3 text-3xl font-bold text-white">YDS LABS</span>
        </div>
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl border border-gray-800">
          <h1 className="text-2xl font-semibold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 mb-8">
            Sign in to access your company dashboard.
          </p>
          <button
            onClick={signIn}
            className="w-full inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-900"
          >
            <svg
              className="w-5 h-5 mr-2"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 399.5 0 256S111.8 0 244 0c69.8 0 130.8 28.5 173.4 74.5l-68.2 66.3C314.5 112.5 282.5 96 244 96c-83.8 0-152.3 68.4-152.3 159.9s68.5 159.9 152.3 159.9c97.7 0 130.6-72.2 134.6-110.6H244v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"
              ></path>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;