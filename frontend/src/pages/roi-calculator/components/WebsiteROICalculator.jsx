import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const WebsiteROICalculator = ({ onScheduleConsultation }) => {
  const [inputs, setInputs] = useState({
    monthlyVisitors: 5000,
    currentConversionRate: 1.5,
    targetConversionRate: 3,
    avgOrderValue: 5000
  });

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const results = useMemo(() => {
    const visitors = parseFloat(inputs?.monthlyVisitors) || 0;
    const currentRate = parseFloat(inputs?.currentConversionRate) || 0;
    const targetRate = parseFloat(inputs?.targetConversionRate) || 0;
    const avgOrderValue = parseFloat(inputs?.avgOrderValue) || 0;

    const currentCustomers = visitors * (currentRate / 100);
    const projectedCustomers = visitors * (targetRate / 100);
    const currentMonthlyRevenue = currentCustomers * avgOrderValue;
    const projectedMonthlyRevenue = projectedCustomers * avgOrderValue;
    const additionalMonthlyRevenue = projectedMonthlyRevenue - currentMonthlyRevenue;
    const additionalAnnualRevenue = additionalMonthlyRevenue * 12;

    return {
      currentMonthlyRevenue: Math.round(currentMonthlyRevenue),
      projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue),
      additionalMonthlyRevenue: Math.round(additionalMonthlyRevenue),
      additionalAnnualRevenue: Math.round(additionalAnnualRevenue),
      additionalCustomersPerMonth: Math.round(projectedCustomers - currentCustomers)
    };
  }, [inputs]);

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Inputs */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6">
          Tell Us About Your Website
        </h3>
        <div className="space-y-5">
          <Input
            label="Monthly Website Visitors"
            type="number"
            name="monthlyVisitors"
            min="0"
            value={inputs?.monthlyVisitors}
            onChange={handleChange}
          />
          <Input
            label="Current Conversion Rate (%)"
            type="number"
            name="currentConversionRate"
            min="0"
            step="0.1"
            value={inputs?.currentConversionRate}
            onChange={handleChange}
            description="% of visitors who currently become customers/leads"
          />
          <Input
            label="Target Conversion Rate (%)"
            type="number"
            name="targetConversionRate"
            min="0"
            step="0.1"
            value={inputs?.targetConversionRate}
            onChange={handleChange}
            description="Realistic rate with a faster, conversion-focused website"
          />
          <Input
            label="Average Order / Deal Value (₹)"
            type="number"
            name="avgOrderValue"
            min="0"
            value={inputs?.avgOrderValue}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6">
          Your Revenue Opportunity
        </h3>

        <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 border border-[var(--color-primary)]/20 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-muted-foreground)]">Additional Annual Revenue</span>
            <Icon name="TrendingUp" size={20} className="text-[var(--color-primary)]" />
          </div>
          <div className="text-4xl font-bold text-[var(--color-primary)] mb-1">
            ₹{results?.additionalAnnualRevenue?.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            ₹{results?.additionalMonthlyRevenue?.toLocaleString('en-IN')} extra every month
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--color-muted)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Users" size={16} className="text-[var(--color-accent)]" />
              <span className="text-xs text-[var(--color-muted-foreground)]">More Customers</span>
            </div>
            <div className="text-2xl font-bold text-[var(--color-foreground)]">
              +{results?.additionalCustomersPerMonth?.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)]">per month</p>
          </div>

          <div className="bg-[var(--color-muted)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="BarChart3" size={16} className="text-[var(--color-accent)]" />
              <span className="text-xs text-[var(--color-muted-foreground)]">Revenue Today</span>
            </div>
            <div className="text-2xl font-bold text-[var(--color-foreground)]">
              ₹{results?.currentMonthlyRevenue?.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)]">per month</p>
          </div>
        </div>

        <Button
          variant="default"
          size="lg"
          iconName="Calendar"
          iconPosition="left"
          onClick={onScheduleConsultation}
        >
          Talk to Us About My Website
        </Button>
        <p className="text-xs text-[var(--color-muted-foreground)] text-center mt-3">
          Estimate only — actual results depend on your industry, offer, and traffic quality.
        </p>
      </div>
    </div>
  );
};

export default WebsiteROICalculator;
