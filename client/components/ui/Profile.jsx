import { useState } from 'react';
import { Button, Popover, Text, Stack } from '@mantine/core';
import { useRouteContext } from '/:core.jsx';

export function Profile() {
  const { state, actions } = useRouteContext();
  const [opened, setOpened] = useState(false);

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
          <Button onClick={() => actions.logout(state)}>Logout</Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
