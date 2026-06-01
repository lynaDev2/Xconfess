/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DiagnosticsPage from '../page';
import { adminApi } from '@/app/lib/api/admin';
import { fetchStellarConfig } from '@/app/lib/api/stellar';

jest.mock('@/app/lib/api/admin', () => ({
  adminApi: {
    getObservability: jest.fn(),
  },
}));

jest.mock('@/app/lib/api/stellar', () => ({
  fetchStellarConfig: jest.fn(),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('DiagnosticsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders diagnostics sections and observability metrics', async () => {
    (fetchStellarConfig as jest.Mock).mockResolvedValue({
      network: 'Test Network',
      horizonUrl: 'https://horizon.testnet.stellar.org',
      sorobanRpcUrl: 'https://rpc.testnet.stellar.org',
      contractIds: {
        confessionAnchor: 'ABC123',
        reputationBadges: 'DEF456',
        tippingSystem: 'GHI789',
      },
    });

    (adminApi.getObservability as jest.Mock).mockResolvedValue({
      audit: {
        totalLogs: 42,
        actionTypeCounts: [{ actionType: 'create', count: 18 }],
      },
      notifications: {
        main: { active: 2, waiting: 1, failed: 0 },
        dlq: { failed: 0, waiting: 0, delayed: 0 },
      },
      generatedAt: '2025-01-01T00:00:00Z',
    });

    renderWithProviders(<DiagnosticsPage />);

    expect(screen.getByText('Stellar Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Admin Observability')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Network')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('create')).toBeInTheDocument();
    });
  });

  it('shows an error message when observability loading fails', async () => {
    (fetchStellarConfig as jest.Mock).mockResolvedValue({
      network: 'Test Network',
      horizonUrl: 'https://horizon.testnet.stellar.org',
      sorobanRpcUrl: 'https://rpc.testnet.stellar.org',
      contractIds: {
        confessionAnchor: 'ABC123',
        reputationBadges: 'DEF456',
        tippingSystem: 'GHI789',
      },
    });
    (adminApi.getObservability as jest.Mock).mockRejectedValue(new Error('API failure'));

    renderWithProviders(<DiagnosticsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Failed to load admin observability metrics. Ensure the backend is running and accessible.',
        ),
      ).toBeInTheDocument();
    });
  });
});
