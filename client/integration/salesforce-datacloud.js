export class SalesforceDataCloud {
  static async init({ user }) {
    if (typeof SalesforceInteractions === 'undefined') {
      console.warn('[WARN] Salesforce Data Cloud Connector not loaded');
      return;
    }

    SalesforceInteractions.setLoggingLevel('error');

    // Global listeners
    const { OnEventSend, OnException } = SalesforceInteractions.CustomEvents;
    const handleOnEventSend = (event) => {
      console.log('Custom event sent:', event);
    };
    const handleOnException = (error, context) => {
      console.error('Error:', error, context);
    };

    // Cleanup existing listeners
    document.removeEventListener(OnEventSend, handleOnEventSend);
    document.removeEventListener(OnException, handleOnException);

    // Add new listeners
    document.addEventListener(OnEventSend, handleOnEventSend);
    document.addEventListener(OnException, handleOnException);

    // Setup cookie
    const cookieDomain =
      window.location.hostname === 'localhost'
        ? '.lumina-solar.localhost'
        : 'lumina-solar.herokuapp.com';

    // Start Data Cloud Web SDK
    await SalesforceInteractions.init({
      cookieDomain,
      consents: [
        {
          provider: 'Lumina Solar',
          purpose: 'Tracking',
          status: SalesforceInteractions.ConsentStatus.OptIn,
        },
      ],
    });

    let href = window.location.href;
    setInterval(() => {
      if (href !== window.location.href) {
        href = window.location.href;
        SalesforceInteractions.reinit();
      }
    }, 200);

    // Check if user is logged in
    let userAttributes = null;
    if (user) {
      userAttributes = {
        attributes: {
          eventType: 'contactPointEmail',
          email: user.email,
        },
      };
    }

    // Setup global sitemap object
    const global = {
      listeners: [
        SalesforceInteractions.listener('click', 'a.nav-link', (_event) => {
          SalesforceInteractions.sendEvent({
            interaction: {
              name: 'Navigation Click',
              eventType: 'navigationClick',
            },
            user: userAttributes ? userAttributes : null,
          });
        }),
      ],
    };
    const pageTypeDefault = {
      name: 'default',
      interaction: {
        name: 'Default Page',
      },
    };

    // Setup sitemap
    const sitemapConfig = {
      global,
      pageTypeDefault,
      pageTypes: [
        {
          name: 'category',
          isMatch: () => window.location.pathname.includes('/product'),
          interaction: {
            name: 'Products Page',
          },
          listeners: [
            SalesforceInteractions.listener(
              'click',
              '[data-add-to-cart]',
              (event) => {
                const product = event.target.closest('[data-product]');
                SalesforceInteractions.sendEvent({
                  interaction: {
                    name: 'Add Product',
                    eventType: 'luminaAddProduct',
                    productId: product.getAttribute('data-productid'),
                    productName: product.getAttribute('data-productname'),
                  },
                  user: userAttributes ? userAttributes : null,
                });
              }
            ),
            SalesforceInteractions.listener(
              'click',
              '[data-remove-from-cart]',
              (event) => {
                const product = event.target.closest('[data-product]');
                SalesforceInteractions.sendEvent({
                  interaction: {
                    name: 'Remove Product',
                    eventType: 'luminaRemoveProduct',
                    productId: product.getAttribute('data-productid'),
                    productName: product.getAttribute('data-productname'),
                  },
                  user: userAttributes ? userAttributes : null,
                });
              }
            ),
          ],
        },
      ],
    };

    SalesforceInteractions.initSitemap(sitemapConfig);
  }
}
