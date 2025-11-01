# Custom Slip Analyzer

Analyze any custom slip to get rating, risk level, and edge gap calculations.

## 📋 Quick Start

### Step 1: Find Props
```bash
node list_props.js
```

Search for specific player:
```bash
node list_props.js "lebron" 20
node list_props.js "curry"
node list_props.js "josh hart"
```

### Step 2: Analyze Your Slip
Use the row numbers from step 1:
```bash
node analyze_slip_by_ids.js 96 167 644
```

## 📊 Output Explained

### Rating (0-10 scale)
- **7.0+** = High quality slip
- **5.0-6.9** = Medium quality slip
- **< 5.0** = Low quality slip

**Weights:**
- H2H: 25%
- L5: 20%
- L10: 15%
- Current Season: 10%
- Edge Gap: 20%
- Defense Rank: 10%

### Risk Level
- **LOW**: H2H > 75% AND L10 > 65% AND Edge > 12%
- **MEDIUM**: H2H > 65% AND L5 > 60% AND Edge > 8%
- **HIGH**: Anything else

### Edge Gap
Total percentage edge across all legs. Higher is better (means more +EV).

## 💡 Examples

### Example 1: Find Good Same-Game Parlay Props
```bash
# Find all props for a specific team matchup
node list_props.js "chicago bulls" 30

# Build a 5-pick slip
node analyze_slip_by_ids.js 10 15 23 45 67
```

### Example 2: Test Elite Props Only
```bash
# Get props with ✅ Regular approval
node list_props.js | grep "✅"

# Analyze top 3 elite props
node analyze_slip_by_ids.js 1 2 3
```

### Example 3: Compare Slips
```bash
# Slip A
node analyze_slip_by_ids.js 1 5 10

# Slip B
node analyze_slip_by_ids.js 2 6 11

# Compare the ratings and risk levels
```

## 🔍 Tips

1. **Look for consistent stats** - Props with high H2H, L5, L10 are safer
2. **Balance edge vs safety** - High edge with low safety = risky
3. **Check trends** - ↑ means improving, ↓ means declining
4. **Mix same-game props** - SGPs can have better correlation
5. **Aim for LOW risk** - Especially for larger slips

## 📁 Files

- `list_props.js` - Browse and search all available props
- `analyze_slip_by_ids.js` - Analyze custom slip by row numbers
- `analyze_custom_slip.js` - Interactive mode (work in progress)
