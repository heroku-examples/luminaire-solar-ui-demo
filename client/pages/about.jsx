import { title } from '@/theme.js';
import { Container, Text, Title, Grid, Image, Group } from '@mantine/core';
import { IconSun } from '@tabler/icons-react';
import residential from '@/assets/img/residential.jpg';

function AboutPage() {
  return (
    <Container>
      <Grid>
        <Grid.Col span={12}>
          <Title order={1} align="center">
            <Group justify="center">
              <IconSun color="orange" size={34} />
              {title}
            </Group>
          </Title>
        </Grid.Col>

        <Grid.Col span={12} md={6}>
          <Text size="lg" align="left" my="lg">
            {title} is a leading provider of sustainable energy solutions,
            offering a wide range of services for commercial, residential, and
            industrial clients. Our mission is to power the future with clean,
            renewable energy sources, including both solar and wind energy.
          </Text>

          <Grid.Col span={12} md={6}>
            <Image
              src={residential}
              alt="Solar panels and wind turbines"
              withPlaceholder
            />
          </Grid.Col>

          <Text size="lg" align="left" my="lg">
            With years of experience in the energy industry, {title} is
            committed to delivering top-quality installations, innovative energy
            solutions, and unmatched customer service. Whether you're looking to
            reduce your carbon footprint at home, optimize energy use in your
            business, or implement large-scale industrial energy projects,
            {title} has the expertise and solutions you need.
          </Text>

          <Text size="lg" align="left" my="lg">
            Join us in creating a brighter, greener future. Discover how Lumina
            Solar can help you harness the power of the sun and wind to meet
            your energy needs.
          </Text>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export function getMeta() {
  return {
    title: `${title} - About`,
  };
}

export default function About() {
  return <AboutPage />;
}
