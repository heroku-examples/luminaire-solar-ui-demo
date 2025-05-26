import { useState } from 'react';
import { useRouteContext } from '/:core.jsx';
import Logo from '../icons/Logo.jsx';

export function LoginButton({ onClick }) {
  return (
    <div
      className="text-white bg-purple-40 px-6 py-1.5 rounded-full cursor-pointer"
      onClick={() => onClick((prev) => !prev)}
    >
      Login
    </div>
  );
}

export function Login() {
  const { state, actions } = useRouteContext();
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);

  const handleAuthenticate = async () => {
    try {
      await actions.authenticate(state, { username, password });
    } catch (error) {
      setError(error.message);
    }
  };
  const handleOnClose = () => {
    setUsername('');
    setPassword('');
    setError(null);
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div>
          <div
            className="absolute top-0 left-0 w-[100vw] h-[100vh] z-10 bg-lightest-grey bg-opacity-50 border border-light-grey"
            onClick={handleOnClose}
          />
          <div className="absolute top-0 left-0 w-[100vw] h-[100vh]">
            <form className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 bg-lightest-grey rounded-lg flex flex-col gap-4">
              <div className="w-full flex justify-center">
                <Logo />
              </div>
              <div className="flex justify-between items-center gap-4 pt-8">
                <p className="text-dark-grey">Username</p>
                <input
                  type="text"
                  className="p-2"
                  required
                  onChange={(event) => setUsername(event.currentTarget.value)}
                />
              </div>
              <div className="flex justify-between items-center gap-4">
                <p className="text-dark-grey">Password</p>
                <input
                  type="password"
                  className="p-2"
                  required
                  onChange={(event) => setPassword(event.currentTarget.value)}
                />
              </div>
              <div className="w-full flex justify-end">
                <button
                  className="text-white bg-purple-40 px-6 py-1.5 rounded-full cursor-pointer mt-4"
                  onClick={handleAuthenticate}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <LoginButton onClick={setOpen} />
    </>
  );
}
