import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { publicApi } from '../../../lib/apiClient';

const ProductROICalculator = ({ onScheduleConsultation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [inputs, setInputs] = useState({
    employees: 20,
    avgSalary: 300000,
    hoursPerWeek: 5,
    currentCost: 0
  });

  useEffect(() => {
    publicApi
      .get('/products')
      .then((res) => {
        const mapped = res.data.map((p) => ({ ...p, pricing: { annual: p.pricingAnnual } }));
        setProducts(mapped);
        if (mapped?.length) setSelectedProductId(mapped?.[0]?.id);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedProduct = useMemo(
    () => products?.find((p) => p?.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const results = useMemo(() => {
    if (!selectedProduct) return null;

    const employees = parseFloat(inputs?.employees) || 0;
    const avgSalary = parseFloat(inputs?.avgSalary) || 0;
    const hoursPerWeek = parseFloat(inputs?.hoursPerWeek) || 0;
    const currentCost = parseFloat(inputs?.currentCost) || 0;

    const hourlyRate = avgSalary / 2080;
    const weeklyTimeSavings = hoursPerWeek * employees;
    const annualTimeSavings = weeklyTimeSavings * 52;
    const annualCostSavings = annualTimeSavings * hourlyRate;

    const productCost = selectedProduct?.pricing?.annual || 0;
    const netSavings = annualCostSavings + currentCost - productCost;
    const roi = productCost ? ((netSavings / productCost) * 100)?.toFixed(1) : '0.0';
    const paybackMonths =
      productCost && netSavings > 0 ? (productCost / (netSavings / 12))?.toFixed(1) : '—';

    return {
      annualTimeSavings: Math.round(annualTimeSavings),
      annualCostSavings: Math.round(annualCostSavings),
      netSavings: Math.round(netSavings),
      roi,
      paybackMonths,
      productCost
    };
  }, [inputs, selectedProduct]);

  if (loading) {
    return (
      <p className="text-center text-[var(--color-muted-foreground)] py-10">Loading products...</p>
    );
  }

  if (!products?.length) {
    return (
      <p className="text-center text-[var(--color-muted-foreground)] py-10">
        No products available to calculate ROI for right now.
      </p>
    );
  }

  return (
    <div>
      {/* Product Picker */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
          Which Product Are You Evaluating?
        </h3>
        <div className="flex flex-wrap gap-3">
          {products?.map((product) => (
            <button
              key={product?.id}
              type="button"
              onClick={() => setSelectedProductId(product?.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                selectedProductId === product?.id
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
              }`}
            >
              {product?.icon && <Icon name={product?.icon} size={16} />}
              <span className="text-sm font-medium">{product?.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Inputs */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6">
            Enter Your Business Details
          </h3>
          <div className="space-y-5">
            <Input
              label="Number of Employees"
              type="number"
              name="employees"
              min="0"
              value={inputs?.employees}
              onChange={handleChange}
              description="Total employees who will use the system"
            />
            <Input
              label="Average Annual Salary (₹)"
              type="number"
              name="avgSalary"
              min="0"
              value={inputs?.avgSalary}
              onChange={handleChange}
              description="Average salary of employees using the system"
            />
            <Input
              label="Hours Saved Per Employee/Week"
              type="number"
              name="hoursPerWeek"
              min="0"
              value={inputs?.hoursPerWeek}
              onChange={handleChange}
              description="Estimated time savings per employee per week"
            />
            <Input
              label="Current System Annual Cost (₹)"
              type="number"
              name="currentCost"
              min="0"
              value={inputs?.currentCost}
              onChange={handleChange}
              description="Your current solution's annual cost, if any"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
            {selectedProduct?.image && (
              <span className="w-8 h-8 rounded-md overflow-hidden bg-[var(--color-muted)] flex-shrink-0">
                <Image src={selectedProduct?.image} alt="" className="w-full h-full object-cover" />
              </span>
            )}
            Your Projected Results with {selectedProduct?.name}
          </h3>

          <div className="bg-gradient-to-br from-[var(--color-brand-success)]/10 to-[var(--color-brand-success)]/5 border border-[var(--color-brand-success)]/20 rounded-xl p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-muted-foreground)]">Return on Investment</span>
              <Icon name="TrendingUp" size={20} className="text-[var(--color-brand-success)]" />
            </div>
            <div className="text-4xl font-bold text-[var(--color-brand-success)] mb-1">
              {results?.roi}%
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)]">Annual ROI on your investment</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-[var(--color-muted)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Clock" size={16} className="text-[var(--color-accent)]" />
                <span className="text-xs text-[var(--color-muted-foreground)]">Time Saved</span>
              </div>
              <div className="text-2xl font-bold text-[var(--color-foreground)]">
                {results?.annualTimeSavings?.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-[var(--color-muted-foreground)]">hours/year</p>
            </div>

            <div className="bg-[var(--color-muted)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Calendar" size={16} className="text-[var(--color-accent)]" />
                <span className="text-xs text-[var(--color-muted-foreground)]">Payback Period</span>
              </div>
              <div className="text-2xl font-bold text-[var(--color-foreground)]">
                {results?.paybackMonths}
              </div>
              <p className="text-xs text-[var(--color-muted-foreground)]">months</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-[var(--color-muted)] rounded-lg">
              <span className="text-sm text-[var(--color-foreground)]">Annual Cost Savings</span>
              <span className="text-base font-bold text-[var(--color-brand-success)]">
                ₹{results?.annualCostSavings?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--color-muted)] rounded-lg">
              <span className="text-sm text-[var(--color-foreground)]">{selectedProduct?.name} Annual Cost</span>
              <span className="text-base font-bold text-[var(--color-foreground)]">
                ₹{results?.productCost?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[var(--color-brand-success)]/10 to-[var(--color-brand-success)]/5 border border-[var(--color-brand-success)]/20 rounded-lg">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">Net Annual Savings</span>
              <span className="text-lg font-bold text-[var(--color-brand-success)]">
                ₹{results?.netSavings?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            iconName="Calendar"
            iconPosition="left"
            onClick={onScheduleConsultation}
          >
            Schedule a Consultation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductROICalculator;
