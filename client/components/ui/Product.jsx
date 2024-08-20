import {
  Card,
  Image,
  Text,
  Group,
  Center,
  Button,
  NumberFormatter,
} from '@mantine/core';
import { useRouteContext } from '/:core.jsx';
import classes from '@/components/ui/Product.module.css';

export function Product({ product }) {
  const { state, actions } = useRouteContext();

  const loggedIn = state.user && state.user.username != null;

  const addToCart = (product) => () => {
    actions.addToCart(state, product);
  };

  return (
    <Card
      withBorder
      shadow="lg"
      radius="md"
      className={classes.card}
      styles={{
        root: { justifyContent: 'space-between' },
      }}
      mod={{
        product: true,
        productid: product.id,
        productname: product.name,
      }}
    >
      <Card.Section className={classes.title}>
        <Text fw={600}>{product.name}</Text>
      </Card.Section>
      <Center>
        <Image
          preload="auto"
          src={product.imageUrl}
          alt={product.name}
          w={300}
          className={classes.imageSection}
        />
      </Center>
      <Group>
        <Text fz="sm" c="dimmed">
          {product.description}
        </Text>
      </Group>
      <Card.Section className={classes.section}>
        <Group justify="space-between">
          <Text fz="xl" fw={700} mt={3}>
            <NumberFormatter
              prefix="$"
              value={product.price}
              thousandSeparator
            />
          </Text>
          {loggedIn && (
            <Button
              variant="light"
              mod="data-add-to-cart"
              onClick={addToCart(product)}
            >
              Add to cart
            </Button>
          )}
        </Group>
      </Card.Section>
    </Card>
  );
}
