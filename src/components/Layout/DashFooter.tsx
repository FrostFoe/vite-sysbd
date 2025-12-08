import React from 'react';

interface DashFooterProps {
  type: 'admin' | 'dashboard';
}

const DashFooter: React.FC<DashFooterProps> = ({ type }) => {
  const year = new Date().getFullYear();
  const text =
    type === 'admin'
      ? `© ${year} BreachTimes Admin Panel. All rights reserved.`
      : `© ${year} BreachTimes Dashboard. All rights reserved.`;

  return (
    <footer className="border-t border-border-color bg-card py-6 mt-auto shrink-0">
      <div className="container mx-auto px-4 text-center text-muted-text text-xs">
        {text}
      </div>
    </footer>
  );
};

export default DashFooter;
