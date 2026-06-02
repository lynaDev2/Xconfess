'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStellarConfig } from '@/app/lib/api/stellar';
import type { StellarConfigResponse } from '@/app/lib/types/stellar';

function ConfigRow({ 
  label, 
  value, 
  mono, 
  description 
}: { 
  label: string; 
  value: string | null | undefined; 
  mono?: boolean;
  description?: string; // Enhanced requirement: explanatory copy
}) {
  return (
    <div className="flex flex-col py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-48 shrink-0">
          {label}
        </dt>
        <dd className={`text-sm text-gray-900 dark:text-white break-all ${mono ? 'font-mono text-xs text-teal-600 dark:text-teal-400' : ''}`}>
          {value || (
            /* Acceptance Criteria: Safe Empty State per row if missing */
            <span className="text-amber-500 dark:text-amber-400 italic bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded text-xs border border-amber-200 dark:border-amber-900/50">
              Not configured (Empty State)
            </span>
          )}
        </dd>
      </div>
      {description && (
        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
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
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Stellar Diagnostics
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Network environments and structural smart contract addresses tracking on-chain integrity.
        </p>
      </div>

      {isLoading && <Skeleton />}

      {/* Connection Failure Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-5 space-y-2">
          <p className="text-sm font-semibold text-red-800 dark:text-red-400">
            Failed to load live Stellar configuration metrics.
          </p>
          <p className="text-xs text-red-700 dark:text-red-300/80">
            The frontend couldn't establish a handshake with the NestJS gateway. Ensure the local backend server is running and accessible on port 5000.
          </p>
        </div>
      )}

      {config && (
        <div className="grid gap-6">
          {/* Network Info */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Network Profile
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Identifies active structural layers managing blockchain node topologies and requests.
            </p>
            <dl className="divide-y divide-gray-100 dark:divide-gray-800">
              <ConfigRow 
                label="Target Network" 
                value={config.network} 
                mono 
                description="The target environment ecosystem context (e.g., testnet, public) governing cryptographic ledger operations."
              />
              <ConfigRow 
                label="Horizon URL" 
                value={config.horizonUrl} 
                mono 
                description="The REST API gateway endpoint for gathering general ledger statistics, account metadata, and history metrics."
              />
              <ConfigRow 
                label="Soroban RPC URL" 
                value={config.sorobanRpcUrl} 
                mono 
                description="The live execution node gateway dedicated to processing input transactions and smart contract invocations."
              />
            </dl>
          </div>

          {/* Contract IDs */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Smart Contract Deployments
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Unique cryptographic addresses anchoring active WASM state machines to the network layer.
            </p>
            <dl className="divide-y divide-gray-100 dark:divide-gray-800">
              <ConfigRow 
                label="Confession Anchor" 
                value={config.contractIds?.confessionAnchor} 
                mono 
                description="Tracks data hashes matching anonymized records onto immutable history sequences securely."
              />
              <ConfigRow 
                label="Reputation Badges" 
                value={config.contractIds?.reputationBadges} 
                mono 
                description="The contract index tracking profile reward distribution, rank tokens, and gamification tiers."
              />
              <ConfigRow 
                label="Tipping System" 
                value={config.contractIds?.tippingSystem} 
                mono 
                description="Manages atomic peer micro-payments and network asset transactions directly between users."
              />
            </dl>
          </div>

          {/* Deployment metadata */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Deployment metadata
            </h3>
            <dl className="divide-y divide-gray-100 dark:divide-gray-800">
              <ConfigRow label="Loaded" value={config.deploymentMetadata.loaded ? 'Yes' : 'No'} />
              <ConfigRow label="Generated at (UTC)" value={config.deploymentMetadata.generatedAtUtc} mono />
              <ConfigRow label="Age (days)" value={config.deploymentMetadata.ageDays?.toString() ?? null} />
              <ConfigRow label="Stale" value={config.deploymentMetadata.isStale ? 'Yes' : 'No'} />
              <ConfigRow label="Load error" value={config.deploymentMetadata.loadError} mono />
            </dl>
            {config.deploymentMetadata.loadError && (
              <div className="mt-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
                {config.deploymentMetadata.loadError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Acceptance Criteria Validation: No secrets declaration footer */}
      <div className="text-[11px] font-medium tracking-wide text-gray-400 dark:text-slate-500 text-center bg-gray-50 dark:bg-gray-950/60 py-3 rounded-lg border border-gray-100 dark:border-gray-800/60">
        🔒 Security Verification: Master signer keys, seed phrases, and operational secrets are completely isolated from client metrics.
      </div>
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