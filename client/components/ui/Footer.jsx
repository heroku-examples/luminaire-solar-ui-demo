import { Link } from 'react-router-dom';
import FullLogo from '../icons/Logo';

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
      <div className="p-12 pb-36 bg-light-grey flex justify-between">
        <div>
          <Link to="/" className="nav-link" style={{ padding: 0 }}>
            <FullLogo />
          </Link>
        </div>
        <div className="flex flex-row gap-12">
          <div className="flex flex-col gap-y-2">
            <p className="min-w-48 text-sm">Customer Service</p>
            {customerServiceLinks.map((link) => {
              return (
                <div key={`footer${link.link}`}>
                  <Link
                    to={link.link}
                    className={`text-dark-grey font-medium text-sm`}
                    style={{ padding: 0 }}
                  >
                    {link.label}
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-y-2">
            <p className="min-w-48 text-sm">About Us</p>
            {aboutUsLinks.map((link) => {
              return (
                <div key={`footer${link.link}`}>
                  <Link
                    to={link.link}
                    className={`text-dark-grey font-medium text-sm`}
                    style={{ padding: 0 }}
                  >
                    {link.label}
                  </Link>
                </div>
              );
            })}
          </div>
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
