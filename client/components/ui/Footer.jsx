import { Container, Text, Group, Grid } from '@mantine/core';
import { title, year } from '@/theme.js';

export function Footer() {
  return (
    <footer>
      <Container mt="lg">
        <Grid justify="center">
          <Grid.Col span={12} md={4}>
            <Text size="sm" c="dimmed" align="center">
              Powering the future with solar and wind energy solutions.
            </Text>
          </Grid.Col>
          <Group position="center" spacing="xs" mb="lg">
            <Text size="xs" c="dimmed">
              © {year} {title}. All rights reserved.
            </Text>
          </Group>
        </Grid>
      </Container>
    </footer>
  );
}
