import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { Paper, Title, Button, useMantineTheme, rem } from '@mantine/core';
import classes from '@/components/ui/HomeCarousel.module.css';
import residential from '@/assets/img/residential.jpg';
import commercial from '@/assets/img/commercial.jpg';
import industrial from '@/assets/img/industrial.jpg';
import wind from '@/assets/img/wind.jpg';

export function CarouselCard({ title, image }) {
  return (
    <Paper
      shadow="md"
      p="xl"
      radius="md"
      style={{ backgroundImage: `url(${image})` }}
      className={classes.card}
    >
      <div>
        <Title order={3} className={classes.title}>
          {title}
        </Title>
      </div>
      <Button>Learn more</Button>
    </Paper>
  );
}

export function HomeCarousel() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const slides = [
    { title: 'Residential', image: residential },
    { title: 'Commercial', image: commercial },
    { title: 'Industrial', image: industrial },
    { title: 'Lumina Wind', image: wind },
  ].map((slide) => (
    <Carousel.Slide key={slide.title}>
      <CarouselCard {...slide} />
    </Carousel.Slide>
  ));

  return (
    <Carousel
      slideSize={{ base: '100%', sm: '50%' }}
      slideGap={{ base: rem(2), sm: 'xl' }}
      align="start"
      slidesToScroll={isMobile ? 1 : 2}
    >
      {slides}
    </Carousel>
  );
}
