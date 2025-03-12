import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteContext } from '/:core.jsx';
import profile from '@/assets/img/profile.png';

export function Profile() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="cursor-pointer " onClick={() => setOpen((prev) => !prev)}>
        <img src={profile} className="w-8 h-8" />
      </div>
      {open && <ProfileModal setOpen={setOpen} />}
    </div>
  );
}

function ProfileModal({ setOpen }) {
  const { state, actions } = useRouteContext();
  const navigate = useNavigate();
  return (
    <div>
      <div
        className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-transparent"
        onClick={() => setOpen((prev) => !prev)}
      />
      <div className="absolute -translate-x-1/2 flex flex-col bg-lightest-grey rounded-md p-8 gap-4">
        <p className="text-nowrap">
          {state.user.name} {state.user.last_name}
        </p>
        <button
          className="text-white bg-purple-40 px-6 py-1.5 rounded-full cursor-pointer"
          onClick={async () => {
            navigate('/');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            actions.logout(state);
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
