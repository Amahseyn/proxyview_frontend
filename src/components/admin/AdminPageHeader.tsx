import Link from 'next/link';

type AdminPageHeaderProps = {
  title: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
};

export default function AdminPageHeader({
  title,
  backHref = '/admin',
  backLabel = '← Back to Posts',
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div>
        <Link href={backHref} className="admin-back-link">{backLabel}</Link>
        <h1 className="admin-page-title">{title}</h1>
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </div>
  );
}
