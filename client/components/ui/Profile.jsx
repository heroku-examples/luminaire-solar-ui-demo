import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Popover, Text, Stack } from '@mantine/core';
import { useRouteContext } from '/:core.jsx';

export function Profile() {
  const { state, actions } = useRouteContext();
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

  return (
    <Popover opened={opened} onChange={setOpened}>
      <Popover.Target>
        <Button onClick={() => setOpened((o) => !o)}>
          {state.user.username}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <Text>
            {state.user.name} {state.user.last_name}
          </Text>
          <Text>{state.user.email}</Text>
          <Button
            onClick={async () => {
              navigate('/');
              await new Promise((resolve) => setTimeout(resolve, 1000));
              actions.logout(state);
            }}
          >
            Logout
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
