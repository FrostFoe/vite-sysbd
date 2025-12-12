import { ChevronRight } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
}

/**
 * Breadcrumb Navigation Component
 * Provides hierarchical navigation path
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4 text-muted-text" />,
  maxItems = 4,
}) => {
  let displayItems = items;
  if (items.length > maxItems) {
    displayItems = [
      items[0],
      { label: "..." },
      ...items.slice(items.length - (maxItems - 2)),
    ];
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm">
        {displayItems.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            {index > 0 && <span className="text-muted-text">{separator}</span>}

            {item.href && item.label !== "..." ? (
              <Link
                to={item.href}
                className="text-primary hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  index === displayItems.length - 1
                    ? "text-card-text font-medium"
                    : "text-muted-text"
                }
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

/**
 * Simplified breadcrumb using current location
 * Automatically generates breadcrumbs from URL path
 */
export const RouteBreadcrumb: React.FC = () => {
  const location = window.location.pathname;
  const segments = location.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  let path = "";
  segments.forEach((segment) => {
    path += `/${segment}`;
    items.push({
      label:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: path,
    });
  });

  if (items.length > 0) {
    const lastItem = items[items.length - 1];
    items[items.length - 1] = { label: lastItem.label };
  }

  return <Breadcrumb items={items} />;
};
