import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ROICalculator = ({ products = [], onClose }) => {
  const [selectedProductId, setSelectedProductId] = useState(products?.[0]?.id || '');
  const [inputs, setInputs] = useState({
    employees: '',
    avgSalary: '',
    hoursPerWeek: '',
    currentCost: ''
  });
  const [results, setResults] = useState(null);
  const [visible, setVisible] = useState(false);

  const product = products?.find((p) => p?.id === selectedProductId) || products?.[0];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleProductChange = (e) => {
    setSelectedProductId(e?.target?.value);
    setResults(null);
  };

  const calculateROI = () => {
    const employees = parseFloat(inputs?.employees) || 0;
    const avgSalary = parseFloat(inputs?.avgSalary) || 0;
    const hoursPerWeek = parseFloat(inputs?.hoursPerWeek) || 0;
    const currentCost = parseFloat(inputs?.currentCost) || 0;

    const hourlyRate = avgSalary / 2080;
    const weeklyTimeSavings = hoursPerWeek * employees;
    const annualTimeSavings = weeklyTimeSavings * 52;
    const annualCostSavings = annualTimeSavings * hourlyRate;
    
    const productCost = product?.pricing?.annual;
    const netSavings = annualCostSavings + currentCost - productCost;
    const roi = ((netSavings / productCost) * 100)?.toFixed(1);
    const paybackMonths = (productCost / (netSavings / 12))?.toFixed(1);

    setResults({
      annualTimeSavings: Math.round(annualTimeSavings),
      annualCostSavings: Math.round(annualCostSavings),
      netSavings: Math.round(netSavings),
      roi: roi,
      paybackMonths: paybackMonths,
      productCost: productCost
    });
  };

  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e?.target?.name]: e?.target?.value
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    calculateROI();
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        onClick={(e) => e?.stopPropagation()}
        className={`bg-[var(--color-card)] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
      >
        <div className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-brand-success)] to-[var(--color-accent)] flex items-center justify-center">
              <Icon name="Calculator" size={24} color="white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)]">
                ROI Calculator
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Calculate your potential savings with {product?.name || 'our products'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-lg hover:bg-[var(--color-muted)] transition-colors flex items-center justify-center"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6">
                Enter Your Business Details
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {products?.length > 0 && (
                  <div className="space-y-2">
                    <label htmlFor="roi-product-select" className="text-sm font-medium leading-none text-foreground">
                      Product
                    </label>
                    <select
                      id="roi-product-select"
                      value={selectedProductId}
                      onChange={handleProductChange}
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {products?.map((p) => (
                        <option key={p?.id} value={p?.id}>
                          {p?.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-muted-foreground">Choose which product to calculate ROI for</p>
                  </div>
                )}
                <Input
                  label="Number of Employees"
                  type="number"
                  name="employees"
                  placeholder="50"
                  value={inputs?.employees}
                  onChange={handleChange}
                  description="Total employees who will use the system"
                  required
                />
                <Input
                  label="Average Annual Salary (₹)"
                  type="number"
                  name="avgSalary"
                  placeholder="60000"
                  value={inputs?.avgSalary}
                  onChange={handleChange}
                  description="Average salary of employees using the system"
                  required
                />
                <Input
                  label="Hours Saved Per Employee/Week"
                  type="number"
                  name="hoursPerWeek"
                  placeholder="5"
                  value={inputs?.hoursPerWeek}
                  onChange={handleChange}
                  description="Estimated time savings per employee per week"
                  required
                />
                <Input
                  label="Current System Annual Cost (₹)"
                  type="number"
                  name="currentCost"
                  placeholder="10000"
                  value={inputs?.currentCost}
                  onChange={handleChange}
                  description="Your current solution's annual cost"
                  required
                />

                <Button type="submit" variant="default" fullWidth iconName="TrendingUp">
                  Calculate ROI
                </Button>
              </form>

              <div className="mt-6 bg-[var(--color-muted)] rounded-lg p-4">
                <h4 className="font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                  <Icon name="Info" size={16} />
                  Calculation Methodology
                </h4>
                <ul className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                  <li className="flex items-start gap-2">
                    <Icon name="Dot" size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Time savings converted to cost savings using hourly rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Dot" size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Current system costs factored into net savings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Dot" size={16} className="mt-0.5 flex-shrink-0" />
                    <span>ROI calculated as (Net Savings / Investment) × 100</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              {results ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
                      Your Projected Results
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-[var(--color-brand-success)]/10 to-[var(--color-brand-success)]/5 border border-[var(--color-brand-success)]/20 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[var(--color-muted-foreground)]">
                            Return on Investment
                          </span>
                          <Icon name="TrendingUp" size={20} className="text-[var(--color-brand-success)]" />
                        </div>
                        <div className="text-4xl font-bold text-[var(--color-brand-success)] mb-1">
                          {results?.roi}%
                        </div>
                        <p className="text-xs text-[var(--color-muted-foreground)]">
                          Annual ROI on your investment
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="Clock" size={16} className="text-[var(--color-accent)]" />
                            <span className="text-xs text-[var(--color-muted-foreground)]">
                              Time Saved
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-[var(--color-foreground)]">
                            {results?.annualTimeSavings?.toLocaleString()}
                          </div>
                          <p className="text-xs text-[var(--color-muted-foreground)]">hours/year</p>
                        </div>

                        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="Calendar" size={16} className="text-[var(--color-accent)]" />
                            <span className="text-xs text-[var(--color-muted-foreground)]">
                              Payback Period
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-[var(--color-foreground)]">
                            {results?.paybackMonths}
                          </div>
                          <p className="text-xs text-[var(--color-muted-foreground)]">months</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-[var(--color-muted)] rounded-lg">
                          <span className="text-sm text-[var(--color-foreground)]">
                            Annual Cost Savings
                          </span>
                          <span className="text-lg font-bold text-[var(--color-brand-success)]">
                            ₹{results?.annualCostSavings?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[var(--color-muted)] rounded-lg">
                          <span className="text-sm text-[var(--color-foreground)]">
                            {product?.name} Annual Cost
                          </span>
                          <span className="text-lg font-bold text-[var(--color-foreground)]">
                            ₹{results?.productCost?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--color-brand-success)]/10 to-[var(--color-brand-success)]/5 border border-[var(--color-brand-success)]/20 rounded-lg">
                          <span className="text-sm font-semibold text-[var(--color-foreground)]">
                            Net Annual Savings
                          </span>
                          <span className="text-xl font-bold text-[var(--color-brand-success)]">
                            ₹{results?.netSavings?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        name="Lightbulb"
                        size={20}
                        className="text-[var(--color-primary)] flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <h4 className="font-semibold text-[var(--color-foreground)] mb-2">
                          Ready to Get Started?
                        </h4>
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                          Schedule a consultation to discuss how {product?.name} can deliver these
                          results for your organization.
                        </p>
                        <Button variant="default" size="sm" iconName="Calendar">
                          Schedule Consultation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-6">
                      <Icon name="Calculator" size={40} className="text-[var(--color-muted-foreground)]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-3">
                      Calculate Your ROI
                    </h3>
                    <p className="text-[var(--color-muted-foreground)]">
                      Enter your business details on the left to see your potential return on
                      investment with {product?.name}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;