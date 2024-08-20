import { useMantineTheme } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { useRouteContext } from '/:core.jsx';

import {
  ActionIcon,
  Indicator,
  Popover,
  Table,
  Text,
  NumberFormatter,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

function CartList({ cart }) {
  const { state, actions } = useRouteContext();
  const empty = cart.length === 0;

  const removeFromCart = (item) => () => {
    actions.removeFromCart(state, item);
  };

  if (empty) {
    return <Text>No items in cart</Text>;
  }

  return (
    <Table striped withRowBorders={false}>
      {cart.map((item) => (
        <Table.Tr
          key={item.id}
          mod={{
            product: true,
            productid: item.id,
            productname: item.name,
          }}
        >
          <Table.Td>{item.name}</Table.Td>
          <Table.Td>
            <NumberFormatter prefix="$" value={item.price} thousandSeparator />
          </Table.Td>
          <Table.Td>{item.quantity}</Table.Td>
          <Table.Td>
            <ActionIcon
              variant="filled"
              aria-label="Remove"
              onClick={removeFromCart(item)}
              mod="remove-from-cart"
            >
              <IconTrash size={20} />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>
      ))}
    </Table>
  );
}

export function Cart() {
  const { snapshot } = useRouteContext();
  const disabled = snapshot.cart.length === 0;
  const theme = useMantineTheme();

  return (
    <>
      <Popover width={500} position="bottom" withArrow shadow="md">
        <Popover.Target>
          <Indicator
            color="red"
            label={snapshot.cart.length}
            position="bottom-end"
            radius="xl"
            size="lg"
            disabled={disabled}
            withBorder
          >
            <IconShoppingCart size={32} color={theme.colors.gray[5]} />
          </Indicator>
        </Popover.Target>
        <Popover.Dropdown>
          <CartList cart={snapshot.cart} />
        </Popover.Dropdown>
      </Popover>
    </>
  );
}
