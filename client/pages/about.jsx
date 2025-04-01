import { title } from '@/theme.js';
import { Container, Text, Grid, Image } from '@mantine/core';
import residential from '@/assets/img/residential.jpg';
import SunIcon from '../components/icons/SunIcon';

function AboutPage() {
  return (
    <Container>
      <Grid>
        <Grid.Col span={12}>
          <h1 className="p-2 pt-6">
            <div className="flex gap-1 items-center justify-center text-[#001A28] font-bold text-3xl">
              <SunIcon />
              {title}
            </div>
          </h1>
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
            Join us in creating a brighter, greener future. Discover how {title}{' '}
            can help you harness the power of the sun and wind to meet your
            energy needs.
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
