interface Credentials {
  username: string;
  password: string;
}

interface ChatCompletionRequest {
  question: string;
  sessionId?: string;
  systemId?: string;
}

export const api = {
  async authenticate(credentials: Credentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    return response.json();
  },

  async logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getProfile() {
    const response = await fetch('/api/auth/profile');
    if (response.ok) {
      return response.json();
    }
    return null;
  },

  async getSystemsByUser(authorization: string) {
    const response = await fetch('/api/systems', {
      headers: {
        Authorization: authorization.startsWith('Bearer ')
          ? authorization
          : `Bearer ${authorization}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    return [];
  },

  async getSystemDetails(systemId: string, authorization: string) {
    const response = await fetch(`/api/system/${systemId}`, {
      headers: {
        Authorization: authorization.startsWith('Bearer ')
          ? authorization
          : `Bearer ${authorization}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    return null;
  },

  async getSystemWeather(systemId: string, authorization: string) {
    const response = await fetch(`/api/system/${systemId}/weather`, {
      headers: {
        Authorization: authorization.startsWith('Bearer ')
          ? authorization
          : `Bearer ${authorization}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    return null;
  },

  async getActivityHistory(systemId: string, authorization: string) {
    const response = await fetch(`/api/system/${systemId}/activityHistory`, {
      headers: {
        Authorization: authorization.startsWith('Bearer ')
          ? authorization
          : `Bearer ${authorization}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    return [];
  },

  async getMetrics(systemId: string, date: string, authorization: string) {
    const response = await fetch(`/api/metrics/${systemId}?date=${date}`, {
      headers: {
        Authorization: authorization.startsWith('Bearer ')
          ? authorization
          : `Bearer ${authorization}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    return null;
  },

  async getMetricsSummary(
    systemId: string,
    date: string,
    authorization: string
  ) {
    const response = await fetch(`/api/summary/${systemId}?date=${date}`, {
      headers: {
        Authorization: authorization.startsWith('Bearer ')
          ? authorization
          : `Bearer ${authorization}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    return null;
  },

  async getProducts() {
    const response = await fetch('/api/products');
    if (response.ok) {
      return response.json();
    }
    return [];
  },

  async getProductById(productId: string) {
    const response = await fetch(`/api/products/${productId}`);
    if (response.ok) {
      return response.json();
    }
    return null;
  },

  async getForecast(systemId: string, authorization: string) {
    const response = await fetch(`/api/forecast/${systemId}`, {
      headers: {
        Authorization: authorization.startsWith('Bearer ')
          ? authorization
          : `Bearer ${authorization}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    return null;
  },

  async chatCompletion(body: ChatCompletionRequest, authorization: string) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization.startsWith('Bearer ')
          ? authorization
          : `Bearer ${authorization}`,
      },
      body: JSON.stringify(body),
    });
    return response;
  },
};
