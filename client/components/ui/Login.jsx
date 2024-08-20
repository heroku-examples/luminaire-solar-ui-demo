import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  Alert,
  Modal,
  Button,
  Group,
  TextInput,
  PasswordInput,
  Stack,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useRouteContext } from '/:core.jsx';

export function Login() {
  const { state, actions } = useRouteContext();
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [opened, { open, close }] = useDisclosure(false);

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
    close();
  };

  return (
    <>
      <Modal opened={opened} onClose={handleOnClose} title="Authentication">
        <Stack spacing="md">
          {error && (
            <Alert color="red" icon={<IconAlertCircle />}>
              {error}
            </Alert>
          )}
          <TextInput
            label="Username"
            value={username}
            placeholder="Enter your username"
            onChange={(event) => setUsername(event.currentTarget.value)}
          />
          <PasswordInput
            label="Password"
            value={password}
            placeholder="Enter your password"
            onChange={(event) => setPassword(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleAuthenticate();
              }
            }}
          />
          <Group>
            <Button variant="primary" onClick={handleAuthenticate}>
              Login
            </Button>{' '}
            <Button variant="outline" onClick={handleOnClose}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Button onClick={open}>Login</Button>
    </>
  );
}
