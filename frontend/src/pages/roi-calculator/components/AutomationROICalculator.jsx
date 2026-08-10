import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AutomationROICalculator = ({ onScheduleConsultation }) => {
  const [inputs, setInputs] = useState({
    employees: 10,
    hoursPerWeek: 8,
    monthlySalary: 40000,
    automationRate: 60
  });

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const results = useMemo(() => {
    const employees = parseFloat(inputs?.employees) || 0;
    const hoursPerWeek = parseFloat(inputs?.hoursPerWeek) || 0;
    const monthlySalary = parseFloat(inputs?.monthlySalary) || 0;
    const automationRate = Math.min(parseFloat(inputs?.automationRate) || 0, 100);

    const hourlyRate = (monthlySalary * 12) / 2080;
    const weeklyHoursSaved = employees * hoursPerWeek * (automationRate / 100);
    const annualHoursSaved = weeklyHoursSaved * 52;
    const annualCostSavings = annualHoursSaved * hourlyRate;
    const monthlyCostSavings = annualCostSavings / 12;

    return {
      annualHoursSaved: Math.round(annualHoursSaved),
      annualCostSavings: Math.round(annualCostSavings),
      monthlyCostSavings: Math.round(monthlyCostSavings)
    };
  }, [inputs]);

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Inputs */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6">
          Tell Us About Your Team
        </h3>
        <div className="space-y-5">
          <Input
            label="Employees Doing Repetitive Tasks"
            type="number"
            name="employees"
            min="0"
            value={inputs?.employees}
            onChange={handleChange}
          />
          <Input
            label="Hours Spent on Manual Work / Week (per employee)"
            type="number"
            name="hoursPerWeek"
            min="0"
            value={inputs?.hoursPerWeek}
            onChange={handleChange}
          />
          <Input
            label="Average Monthly Salary per Employee (₹)"
            type="number"
            name="monthlySalary"
            min="0"
            value={inputs?.monthlySalary}
            onChange={handleChange}
          />
          <Input
            label="Estimated Automation Potential (%)"
            type="number"
            name="automationRate"
            min="0"
            max="100"
            value={inputs?.automationRate}
            onChange={handleChange}
            description="How much of that manual work custom software could take off their plate"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6">
          Your Potential Savings
        </h3>

        <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 border border-[var(--color-primary)]/20 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-muted-foreground)]">Estimated Annual Savings</span>
            <Icon name="TrendingUp" size={20} className="text-[var(--color-primary)]" />
          </div>
          <div className="text-4xl font-bold text-[var(--color-primary)] mb-1">
            ₹{results?.annualCostSavings?.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            ₹{results?.monthlyCostSavings?.toLocaleString('en-IN')} back in your pocket every month
          </p>
        </div>

        <div className="bg-[var(--color-muted)] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-muted-foreground)]">Time Freed Up Every Year</span>
            <Icon name="Clock" size={20} className="text-[var(--color-accent)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--color-foreground)]">
            {results?.annualHoursSaved?.toLocaleString('en-IN')} hours
          </div>
        </div>

        <Button
          variant="default"
          size="lg"
          iconName="Calendar"
          iconPosition="left"
          onClick={onScheduleConsultation}
        >
          Get My Free Automation Plan
        </Button>
        <p className="text-xs text-[var(--color-muted-foreground)] text-center mt-3">
          Estimate only — your real numbers depend on your workflows. We'll refine this together.
        </p>
      </div>
    </div>
  );
};

export default AutomationROICalculator;
