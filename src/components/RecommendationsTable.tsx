import type { FunctionComponent, JSX } from 'react';
import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import { withConvexProvider } from '../lib/convex';
import './RecommendationsTable.css';

interface Props extends JSX.IntrinsicAttributes {
  title: string;
}

type Alert = Doc<'hodlAlerts'>;

interface ComputedRow {
  id: Alert['_id'];
  asset: string;
  entryDateLabel: string;
  entryPriceLabel: string;
  currentPriceLabel: string;
  percentLabel: string;
  percentClassName: string | null;
}

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: '2-digit',
});

const formatDate = (value: string): string => {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }
  return dateFormatter.format(new Date(timestamp));
};

const formatPercent = (entryPrice: number, currentPrice: number | null) => {
  if (!currentPrice || entryPrice === 0) {
    return { label: '—', className: null as string | null };
  }

  const pct = (currentPrice / entryPrice - 1) * 100;
  if (!Number.isFinite(pct)) {
    return { label: '—', className: null };
  }

  const sign = pct > 0 ? '+' : '';
  const className = pct >= 0 ? 'pos' : 'neg';
  return { label: `${sign}${pct.toFixed(1)}%`, className };
};

const computeRows = (alerts: Alert[] | undefined, fallbackPrice: number | null): ComputedRow[] | undefined => {
  if (alerts === undefined) {
    return undefined;
  }

  return alerts
    .slice()
    .sort((a, b) => {
      const dateA = Date.parse(a.entryDate);
      const dateB = Date.parse(b.entryDate);
      const sortA = Number.isNaN(dateA) ? a._creationTime : dateA;
      const sortB = Number.isNaN(dateB) ? b._creationTime : dateB;
      return sortB - sortA;
    })
    .map((alert) => {
      const currentPrice =
        typeof alert.currentPrice === 'number' ? alert.currentPrice : fallbackPrice;
      const { label: percentLabel, className: percentClassName } = formatPercent(
        alert.entryPrice,
        currentPrice
      );

      return {
        id: alert._id,
        asset: alert.asset,
        entryDateLabel: formatDate(alert.entryDate),
        entryPriceLabel: numberFormatter.format(alert.entryPrice),
        currentPriceLabel: currentPrice !== null ? numberFormatter.format(currentPrice) : '—',
        percentLabel,
        percentClassName,
      };
    });
};

const RecommendationsTableComponent: FunctionComponent<Props> = ({ title }) => {
  const alerts = useQuery(api.alerts.getClassicAlerts);
  const priceInfo = useQuery(api.prices.getCurrentBtc);
  const fallbackPrice = priceInfo?.price ?? null;

  const rows = useMemo(() => computeRows(alerts, fallbackPrice), [alerts, fallbackPrice]);

  return (
    <section className="wrap">
      <h1 className="title">{title}</h1>
      <div className="table-container" role="region" aria-labelledby="tableCaption">
        {rows === undefined ? (
          <p className="status">Loading classic recommendations…</p>
        ) : rows.length === 0 ? (
          <p className="status">No classic recommendations yet.</p>
        ) : (
          <table className="table">
            <caption id="tableCaption" className="sr-only">
              {title}
            </caption>
            <thead>
              <tr>
                <th>Core Trade Recommendations</th>
                <th>Entry Date</th>
                <th>Entry Price</th>
                <th>% Since Inception</th>
                <th>Current Price</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="asset">{`Buy ${row.asset}`}</td>
                  <td>{row.entryDateLabel}</td>
                  <td>{`$${row.entryPriceLabel}`}</td>
                  <td className={`pct ${row.percentClassName ?? ''}`.trim()}>{row.percentLabel}</td>
                  <td>{`$${row.currentPriceLabel}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default withConvexProvider(RecommendationsTableComponent);
