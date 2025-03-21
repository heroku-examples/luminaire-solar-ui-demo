import { Link } from 'react-router-dom';
import FullLogo from '../icons/Logo';
import { HerokuIcon } from '../icons/HerokuIcon';

export function Footer() {
  const customerServiceLinks = [
    {
      link: '/contact',
      label: 'Contact Us',
    },
    { link: '/order-status', label: 'Order Status' },
    { link: '/faq', label: 'FAQ' },
  ];

  const aboutUsLinks = [
    {
      link: '/about',
      label: 'Our Story',
    },
    { link: '/press', label: 'Press' },
    { link: '/blog', label: 'Blog' },
  ];
  return (
    <footer>
      <div className="p-12 bg-light-grey flex justify-end">
        {/* <div>
          <Link to="/" className="nav-link" style={{ padding: 0 }}>
            <FullLogo />
          </Link>
        </div> */}
        <div className="flex flex-row items-center">
          <p className="text-darkest-grey italic mr-4">Powered by</p>
          <HerokuIcon />
        </div>
      </div>
      {/* <Container mt="lg">
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
      </Container> */}
    </footer>
  );
}
