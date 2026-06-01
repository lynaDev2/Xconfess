'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStellarConfig } from '@/app/lib/api/stellar';
import type { StellarConfigResponse } from '@/app/lib/types/stellar';

function ConfigRow({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-48 shrink-0">
        {label}
      </dt>
      <dd className={`text-sm text-gray-900 dark:text-white break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value || <span className="text-gray-400 italic">Not configured</span>}
      </dd>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      ))}
    </div>
  );
}

export default function DiagnosticsPage() {
  const { data: config, isLoading, error } = useQuery<StellarConfigResponse>({
    queryKey: ['stellar', 'config'],
    queryFn: fetchStellarConfig,
    retry: 2,
    staleTime: 60000,
  });

  const {
    data: observability,
    isLoading: observabilityLoading,
    error: observabilityError,
  } = useQuery({
    queryKey: queryKeys.admin.observability.all(),
    queryFn: () => adminApi.getObservability(),
    staleTime: 60000,
    retry: 2,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Stellar Diagnostics
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Network and contract configuration for the Stellar integration
        </p>
      </div>

      {isLoading && <Skeleton />}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-4">
          <p className="text-sm text-red-700 dark:text-red-300">
            Failed to load Stellar configuration. Ensure the backend is running and accessible.
          </p>
        </div>
      )}

      {config && (
        <div className="grid gap-6">
          {/* Network Info */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Network
            </h3>
            <dl className="divide-y divide-gray-100 dark:divide-gray-800">
              <ConfigRow label="Network" value={config.network} mono />
              <ConfigRow label="Horizon URL" value={config.horizonUrl} mono />
              <ConfigRow label="Soroban RPC URL" value={config.sorobanRpcUrl} mono />
            </dl>
          </div>

          {/* Contract IDs */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contract IDs
            </h3>
            <dl className="divide-y divide-gray-100 dark:divide-gray-800">
              <ConfigRow label="Confession Anchor" value={config.contractIds.confessionAnchor} mono />
              <ConfigRow label="Reputation Badges" value={config.contractIds.reputationBadges} mono />
              <ConfigRow label="Tipping System" value={config.contractIds.tippingSystem} mono />
            </dl>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Observability
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Audit activity and notification queue health for operational review.
            </p>
          </div>
        </div>

        {observabilityLoading && <Skeleton />}

        {observabilityError && (
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              Failed to load admin observability metrics. Ensure the backend is running and accessible.
            </p>
          </div>
        )}

        {observability && (
          <div className="grid gap-6">
            <div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Audit activity
              </h4>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Total logs</dt>
                  <dd className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {observability.audit.totalLogs}
                  </dd>
                </div>
                {observability.audit.actionTypeCounts.map((count) => (
                  <div key={count.actionType} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">{count.actionType}</dt>
                    <dd className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                      {count.count}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Notification queue health
              </h4>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Active workers</dt>
                  <dd className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {observability.notifications.main.active}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Waiting jobs</dt>
                  <dd className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {observability.notifications.main.waiting}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Failed jobs</dt>
                  <dd className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {observability.notifications.main.failed}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">DLQ failed</dt>
                  <dd className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {observability.notifications.dlq.failed}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">DLQ waiting</dt>
                  <dd className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {observability.notifications.dlq.waiting}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">DLQ delayed</dt>
                  <dd className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {observability.notifications.dlq.delayed}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
    </div>
  );
}
